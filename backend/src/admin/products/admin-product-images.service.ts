
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';

@Injectable()
export class AdminProductImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(productId: string, dto: CreateProductImageDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      const type = dto.type ?? ImageType.PRODUCT;
      let variantId: string | null = null;

      if (type === ImageType.VARIANT) {
        if (!dto.variantId) {
          throw new NotFoundException(
            'variantId is required for a variant image.',
          );
        }

        const variant = await tx.productVariant.findFirst({
          where: { id: dto.variantId, productId },
          select: { id: true },
        });

        if (!variant) {
          throw new NotFoundException(
            'Variant not found for this product.',
          );
        }

        variantId = variant.id;
      } else if (dto.variantId) {
        throw new NotFoundException(
          'variantId can only be used with a VARIANT image.',
        );
      }

      if (dto.isPrimary) {
        await tx.productImage.updateMany({
          where: {
            productId,
            type,
            ...(type === ImageType.VARIANT ? { variantId } : {}),
          },
          data: { isPrimary: false },
        });
      }

      return tx.productImage.create({
        data: {
          productId,
          variantId,
          type,
          url: dto.url,
          altText: dto.altText,
          sortOrder: dto.sortOrder ?? 0,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    });
  }

  async remove(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
      select: { id: true },
    });

    if (!image) {
      throw new NotFoundException('Product image not found.');
    }

    await this.prisma.productImage.delete({ where: { id: image.id } });

    return { message: 'Product image deleted successfully.' };
  }
}
