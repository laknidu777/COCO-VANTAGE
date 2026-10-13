
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
      },
    });

    return { data: categories };
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        products: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            isFeatured: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: {
                url: true,
                altText: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(
        `Category with slug "${slug}" was not found`,
      );
    }

    return { data: category };
  }
}
