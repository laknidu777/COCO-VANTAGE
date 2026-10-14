import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class AdminInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(lowStockOnly = false) {
  const variants = await this.prisma.productVariant.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      stockQuantity: true,
      lowStockThreshold: true,
      isActive: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ stockQuantity: 'asc' }, { sku: 'asc' }],
  });

  const items = variants
    .map((variant) => ({
      ...variant,
      isLowStock: variant.stockQuantity <= variant.lowStockThreshold,
    }))
    .filter((variant) => !lowStockOnly || variant.isLowStock);

  return {
    items,
    total: items.length,
  };
}

  async update(variantId: string, dto: UpdateInventoryDto) {
    if (
      dto.stockQuantity === undefined &&
      dto.lowStockThreshold === undefined
    ) {
      throw new BadRequestException(
        'Provide stockQuantity, lowStockThreshold, or both.',
      );
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found.');
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.stockQuantity !== undefined
          ? { stockQuantity: dto.stockQuantity }
          : {}),
        ...(dto.lowStockThreshold !== undefined
          ? { lowStockThreshold: dto.lowStockThreshold }
          : {}),
      },
      select: {
        id: true,
        sku: true,
        name: true,
        stockQuantity: true,
        lowStockThreshold: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      ...updated,
      isLowStock: updated.stockQuantity <= updated.lowStockThreshold,
    };
  }
}