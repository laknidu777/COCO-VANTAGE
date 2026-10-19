
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageType, Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: {
              prices: true,
              images: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async create(dto: CreateProductDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: dto.name.trim(),
            slug: dto.slug.trim().toLowerCase(),
            shortDescription: dto.shortDescription,
            description: dto.description,
            categoryId: dto.categoryId,
            isFeatured: dto.isFeatured ?? false,
            seoTitle: dto.seoTitle,
            seoDescription: dto.seoDescription,
            status: dto.status ?? ProductStatus.DRAFT,
          },
        });

        const sellingCents =
          dto.sellingPrice !== undefined
            ? Math.round(dto.sellingPrice * 100)
            : undefined;
        const buyingCents =
          dto.buyingPrice !== undefined
            ? Math.round(dto.buyingPrice * 100)
            : undefined;

        // Create default variant if price, stock, or sku are provided
        if (
          sellingCents !== undefined ||
          buyingCents !== undefined ||
          dto.stockQuantity !== undefined ||
          dto.sku
        ) {
          const sku =
            dto.sku?.trim().toUpperCase() ||
            `CV-${dto.slug
              .slice(0, 8)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')}-${Math.floor(
              1000 + Math.random() * 9000,
            )}`;

          await tx.productVariant.create({
            data: {
              productId: product.id,
              sku,
              name: `${dto.name.trim()} (Standard)`,
              stockQuantity: dto.stockQuantity ?? 100,
              isDefault: true,
              isActive: true,
              prices: {
                create: [
                  {
                    currency: 'USD',
                    amount: sellingCents ?? 0,
                    buyingPrice: buyingCents ?? null,
                  },
                ],
              },
            },
          });
        }

        // Add primary image if provided
        if (dto.imageUrl && dto.imageUrl.trim()) {
          await tx.productImage.create({
            data: {
              productId: product.id,
              url: dto.imageUrl.trim(),
              altText: dto.name.trim(),
              isPrimary: true,
              type: ImageType.PRODUCT,
              sortOrder: 0,
            },
          });
        }

        return tx.product.findUnique({
          where: { id: product.id },
          include: {
            category: true,
            images: { orderBy: { sortOrder: 'asc' } },
            variants: {
              include: {
                prices: true,
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A product with this slug or SKU already exists.',
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('The specified category was not found.');
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            prices: true,
          },
        },
        images: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Update product base fields
        await tx.product.update({
          where: { id },
          data: {
            ...(dto.name !== undefined && { name: dto.name.trim() }),
            ...(dto.slug !== undefined && {
              slug: dto.slug.trim().toLowerCase(),
            }),
            ...(dto.shortDescription !== undefined && {
              shortDescription: dto.shortDescription,
            }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(dto.categoryId !== undefined && {
              categoryId: dto.categoryId,
            }),
            ...(dto.isFeatured !== undefined && {
              isFeatured: dto.isFeatured,
            }),
            ...(dto.status !== undefined && {
              status: dto.status,
            }),
            ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
            ...(dto.seoDescription !== undefined && {
              seoDescription: dto.seoDescription,
            }),
          },
        });

        const sellingCents =
          dto.sellingPrice !== undefined
            ? Math.round(dto.sellingPrice * 100)
            : undefined;
        const buyingCents =
          dto.buyingPrice !== undefined
            ? Math.round(dto.buyingPrice * 100)
            : undefined;

        // 2. Update or create default variant & prices if pricing or inventory fields are present
        const hasVariantUpdates =
          sellingCents !== undefined ||
          buyingCents !== undefined ||
          dto.stockQuantity !== undefined ||
          dto.sku !== undefined;

        if (hasVariantUpdates) {
          const defaultVariant =
            existing.variants.find((v) => v.isDefault) || existing.variants[0];

          if (defaultVariant) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: defaultVariant.id },
              data: {
                ...(dto.sku !== undefined && {
                  sku: dto.sku.trim().toUpperCase(),
                }),
                ...(dto.stockQuantity !== undefined && {
                  stockQuantity: dto.stockQuantity,
                }),
              },
            });

            // Update or create USD price
            if (sellingCents !== undefined || buyingCents !== undefined) {
              const usdPrice = defaultVariant.prices.find(
                (p) => p.currency === 'USD',
              );

              if (usdPrice) {
                await tx.variantPrice.update({
                  where: { id: usdPrice.id },
                  data: {
                    ...(sellingCents !== undefined && {
                      amount: sellingCents,
                    }),
                    ...(buyingCents !== undefined && {
                      buyingPrice: buyingCents,
                    }),
                  },
                });
              } else {
                await tx.variantPrice.create({
                  data: {
                    variantId: defaultVariant.id,
                    currency: 'USD',
                    amount: sellingCents ?? 0,
                    buyingPrice: buyingCents ?? null,
                  },
                });
              }
            }
          } else {
            // No variant existed yet on this product (e.g. legacy draft)
            const prodName = dto.name?.trim() || existing.name;
            const sku =
              dto.sku?.trim().toUpperCase() ||
              `CV-${existing.slug
                .slice(0, 8)
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')}-${Math.floor(
                1000 + Math.random() * 9000,
              )}`;

            await tx.productVariant.create({
              data: {
                productId: id,
                sku,
                name: `${prodName} (Standard)`,
                stockQuantity: dto.stockQuantity ?? 100,
                isDefault: true,
                isActive: true,
                prices: {
                  create: [
                    {
                      currency: 'USD',
                      amount: sellingCents ?? 0,
                      buyingPrice: buyingCents ?? null,
                    },
                  ],
                },
              },
            });
          }
        }

        // 3. Update or create primary image if imageUrl is provided
        if (dto.imageUrl !== undefined && dto.imageUrl.trim()) {
          const primaryImg =
            existing.images.find((img) => img.isPrimary) || existing.images[0];

          if (primaryImg) {
            await tx.productImage.update({
              where: { id: primaryImg.id },
              data: {
                url: dto.imageUrl.trim(),
                isPrimary: true,
              },
            });
          } else {
            await tx.productImage.create({
              data: {
                productId: id,
                url: dto.imageUrl.trim(),
                altText: dto.name?.trim() || existing.name,
                isPrimary: true,
                type: ImageType.PRODUCT,
                sortOrder: 0,
              },
            });
          }
        }

        return tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            images: { orderBy: { sortOrder: 'asc' } },
            variants: {
              include: {
                prices: true,
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A product with this slug or SKU already exists.',
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('The specified category was not found.');
      }

      throw error;
    }
  }

  async updateStatus(id: string, status: ProductStatus) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Product not found.');
    }

    return this.prisma.product.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        images: true,
        variants: { include: { prices: true } },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            orderItems: { select: { id: true } },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found.');
    }

    // Check if any variant has existing customer orders
    const orderItemCount = existing.variants.reduce(
      (sum, v) => sum + v.orderItems.length,
      0,
    );

    if (orderItemCount > 0) {
      throw new BadRequestException(
        `Cannot delete "${existing.name}" because it is referenced in ${orderItemCount} customer order(s). Please change its status to ARCHIVED instead.`,
      );
    }

    // Clean up cart items referencing these variants, then delete product
    return this.prisma.$transaction(async (tx) => {
      const variantIds = existing.variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.cartItem.deleteMany({
          where: { variantId: { in: variantIds } },
        });
      }

      await tx.product.delete({ where: { id } });

      return {
        message: `Product "${existing.name}" deleted successfully.`,
        id,
      };
    });
  }
}
