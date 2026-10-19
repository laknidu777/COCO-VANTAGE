
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVariantDto } from './create-variant.dto';

@Injectable()
export class AdminVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const sku = dto.sku.trim().toUpperCase();
    const currencies = dto.prices.map((price) =>
      price.currency.trim().toUpperCase(),
    );

    if (currencies.some((currency) => !/^[A-Z]{3}$/.test(currency))) {
      throw new ConflictException(
        'Each currency must be a valid three-letter currency code.',
      );
    }

    if (new Set(currencies).size !== currencies.length) {
      throw new ConflictException(
        'A variant can only have one price per currency.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.isDefault) {
          await tx.productVariant.updateMany({
            where: { productId },
            data: { isDefault: false },
          });
        }

        return tx.productVariant.create({
          data: {
            productId,
            sku,
            name: dto.name.trim(),
            weightGrams: dto.weightGrams,
            isDefault: dto.isDefault ?? false,
            isActive: dto.isActive ?? true,
            prices: {
              create: dto.prices.map((price) => ({
                currency: price.currency.trim().toUpperCase(),
                amount: price.amount,
                buyingPrice: price.buyingPrice ?? null,
              })),
            },
          },
          include: {
            prices: true,
            images: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This SKU or currency price already exists.',
        );
      }

      throw error;
    }
  }
}
