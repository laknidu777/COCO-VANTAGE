
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
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
      return await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.trim().toLowerCase(),
          shortDescription: dto.shortDescription,
          description: dto.description,
          categoryId: dto.categoryId,
          isFeatured: dto.isFeatured ?? false,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          status: ProductStatus.DRAFT,
        },
        include: {
          category: true,
          images: true,
          variants: { include: { prices: true, images: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A product with this slug already exists.');
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
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Product not found.');
    }

    try {
      return await this.prisma.product.update({
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
          ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
          ...(dto.seoDescription !== undefined && {
            seoDescription: dto.seoDescription,
          }),
        },
        include: {
          category: true,
          images: true,
          variants: { include: { prices: true, images: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A product with this slug already exists.');
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
    });
  }
}
