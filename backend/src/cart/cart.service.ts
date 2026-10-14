import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { generateCartToken, hashCartToken } from './cart-token.util';

const CART_LIFETIME_DAYS = 30;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCurrency(currency: string): string {
    const normalized = currency.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new BadRequestException(
        'Currency must be a valid three-letter currency code.',
      );
    }

    return normalized;
  }

  private async findActiveCart(token: string) {
    if (!token || token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
      throw new NotFoundException('Cart not found.');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { tokenHash: hashCartToken(token) },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    if (cart.expiresAt <= new Date()) {
      throw new GoneException('This cart has expired. Please create a new cart.');
    }

    return cart;
  }

  private async buildCartResponse(token: string) {
    const cart = await this.findActiveCart(token);

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
            prices: {
              where: { currency: cart.currency },
              select: {
                currency: true,
                amount: true,
              },
            },
            images: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              take: 1,
              select: {
                url: true,
                altText: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const cartItems = items.map((item) => {
      const price = item.variant.prices[0] ?? null;

      return {
        id: item.id,
        variantId: item.variantId,
        sku: item.variant.sku,
        variantName: item.variant.name,
        product: item.variant.product,
        quantity: item.quantity,
        unitPrice: price?.amount ?? null,
        lineTotal:
          price === null ? null : price.amount * item.quantity,
        currency: cart.currency,
        image: item.variant.images[0] ?? null,
        stockQuantity: item.variant.stockQuantity,
        available:
          item.variant.isActive &&
          item.variant.product.status === ProductStatus.ACTIVE &&
          item.variant.stockQuantity >= item.quantity &&
          price !== null,
      };
    });

    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.lineTotal ?? 0),
      0,
    );

    return {
      id: cart.id,
      currency: cart.currency,
      items: cartItems,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      expiresAt: cart.expiresAt,
    };
  }

  async create(currency = 'USD') {
    const normalizedCurrency = this.normalizeCurrency(currency);
    const token = generateCartToken();

    const cart = await this.prisma.cart.create({
      data: {
        tokenHash: hashCartToken(token),
        currency: normalizedCurrency,
        expiresAt: new Date(
          Date.now() + CART_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
      select: {
        id: true,
        currency: true,
        expiresAt: true,
      },
    });

    return {
      token,
      cart: {
        ...cart,
        items: [],
        itemCount: 0,
        subtotal: 0,
      },
    };
  }

  async getCart(token: string) {
    return this.buildCartResponse(token);
  }

  async addItem(token: string, dto: AddCartItemDto) {
    const cart = await this.findActiveCart(token);
    const currency = this.normalizeCurrency(dto.currency);

    if (currency !== cart.currency) {
      throw new BadRequestException(
        `This cart uses ${cart.currency}. Create a new cart to use ${currency}.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: {
          id: dto.variantId,
          isActive: true,
          product: { status: ProductStatus.ACTIVE },
        },
        include: {
          prices: { where: { currency } },
        },
      });

      if (!variant) {
        throw new NotFoundException(
          'Active product variant not found.',
        );
      }

      if (variant.prices.length === 0) {
        throw new BadRequestException(
          `This variant is not priced in ${currency}.`,
        );
      }

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: variant.id,
          },
        },
      });

      const newQuantity = (existing?.quantity ?? 0) + dto.quantity;

      if (newQuantity > variant.stockQuantity) {
        throw new BadRequestException(
          `Only ${variant.stockQuantity} unit(s) are currently in stock.`,
        );
      }

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQuantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity: dto.quantity,
          },
        });
      }
    });

    return this.buildCartResponse(token);
  }

  async updateItem(
    token: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.findActiveCart(token);

    await this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
        include: {
          variant: {
            include: {
              prices: { where: { currency: cart.currency } },
              product: { select: { status: true } },
            },
          },
        },
      });

      if (!item) {
        throw new NotFoundException('Cart item not found.');
      }

      if (
        !item.variant.isActive ||
        item.variant.product.status !== ProductStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'This product variant is no longer available.',
        );
      }

      if (item.variant.prices.length === 0) {
        throw new BadRequestException(
          `This variant is not priced in ${cart.currency}.`,
        );
      }

      if (dto.quantity > item.variant.stockQuantity) {
        throw new BadRequestException(
          `Only ${item.variant.stockQuantity} unit(s) are currently in stock.`,
        );
      }

      await tx.cartItem.update({
        where: { id: item.id },
        data: { quantity: dto.quantity },
      });
    });

    return this.buildCartResponse(token);
  }

  async removeItem(token: string, itemId: string) {
    const cart = await this.findActiveCart(token);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found.');
    }

    await this.prisma.cartItem.delete({
      where: { id: item.id },
    });

    return this.buildCartResponse(token);
  }

  async clearCart(token: string) {
    const cart = await this.findActiveCart(token);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.buildCartResponse(token);
  }
}