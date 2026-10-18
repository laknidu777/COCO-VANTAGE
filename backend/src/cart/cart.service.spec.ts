import { BadRequestException, GoneException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductStatus } from '@prisma/client';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { hashCartToken } from './cart-token.util';

describe('CartService', () => {
  let service: CartService;
  let prisma: {
    cart: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
    cartItem: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    productVariant: {
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const validToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const cartId = '11111111-1111-1111-1111-111111111111';
  const variantId = '22222222-2222-2222-2222-222222222222';
  const itemId = '33333333-3333-3333-3333-333333333333';

  const mockActiveCart = {
    id: cartId,
    tokenHash: hashCartToken(validToken),
    currency: 'USD',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    prisma = {
      cart: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      cartItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      productVariant: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('create', () => {
    it('creates an anonymous cart and returns 64-character token', async () => {
      prisma.cart.create.mockResolvedValue({
        id: cartId,
        currency: 'USD',
        expiresAt: new Date(),
      });

      const result = await service.create('USD');

      expect(result.token).toBeDefined();
      expect(result.token).toHaveLength(64);
      expect(result.cart.id).toBe(cartId);
      expect(result.cart.currency).toBe('USD');
      expect(result.cart.itemCount).toBe(0);
      expect(result.cart.subtotal).toBe(0);
      expect(prisma.cart.create).toHaveBeenCalled();
    });

    it('rejects invalid currency codes', async () => {
      await expect(service.create('INVALID')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCart', () => {
    it('throws NotFoundException for invalid token length', async () => {
      await expect(service.getCart('short-token')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if cart does not exist in db', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      await expect(service.getCart(validToken)).rejects.toThrow(NotFoundException);
    });

    it('throws GoneException if cart has expired', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockActiveCart,
        expiresAt: new Date(Date.now() - 10000), // in the past
      });

      await expect(service.getCart(validToken)).rejects.toThrow(GoneException);
    });

    it('returns formatted cart with calculated subtotal and itemCount', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockActiveCart);
      prisma.cartItem.findMany.mockResolvedValue([
        {
          id: itemId,
          variantId,
          quantity: 2,
          variant: {
            sku: 'CV-CIN-001',
            name: 'Cinnamon Quills (100g)',
            stockQuantity: 10,
            isActive: true,
            product: {
              id: 'prod-1',
              name: 'Ceylon Cinnamon',
              slug: 'ceylon-cinnamon',
              status: ProductStatus.ACTIVE,
            },
            prices: [{ currency: 'USD', amount: 1599 }],
            images: [{ url: '/quills.jpg', altText: 'Quills' }],
          },
        },
      ]);

      const cart = await service.getCart(validToken);

      expect(cart.id).toBe(cartId);
      expect(cart.currency).toBe('USD');
      expect(cart.itemCount).toBe(2);
      expect(cart.subtotal).toBe(3198); // 1599 * 2
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].lineTotal).toBe(3198);
      expect(cart.items[0].available).toBe(true);
    });
  });

  describe('addItem', () => {
    it('rejects adding an item when currency does not match cart currency', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockActiveCart);

      await expect(
        service.addItem(validToken, {
          variantId,
          quantity: 1,
          currency: 'EUR',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects adding an item if variant is not found or inactive', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockActiveCart);
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(
        service.addItem(validToken, {
          variantId,
          quantity: 1,
          currency: 'USD',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects adding an item exceeding available stock', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockActiveCart);
      prisma.productVariant.findFirst.mockResolvedValue({
        id: variantId,
        stockQuantity: 2,
        prices: [{ currency: 'USD', amount: 1999 }],
      });
      prisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.addItem(validToken, {
          variantId,
          quantity: 5, // exceeds 2
          currency: 'USD',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItem and clearCart', () => {
    it('removes an item from the cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockActiveCart);
      prisma.cartItem.findFirst.mockResolvedValue({ id: itemId });
      prisma.cartItem.delete.mockResolvedValue({ id: itemId });
      prisma.cartItem.findMany.mockResolvedValue([]);

      const result = await service.removeItem(validToken, itemId);

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: itemId } });
      expect(result.items).toHaveLength(0);
      expect(result.subtotal).toBe(0);
    });

    it('clears all items from the cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockActiveCart);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });
      prisma.cartItem.findMany.mockResolvedValue([]);

      const result = await service.clearCart(validToken);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId } });
      expect(result.items).toHaveLength(0);
    });
  });
});
