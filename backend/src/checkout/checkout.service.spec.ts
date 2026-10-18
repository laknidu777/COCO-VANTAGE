import {
  BadRequestException,
  ConflictException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentProvider, PaymentStatus, ProductStatus } from '@prisma/client';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { hashCartToken } from '../cart/cart-token.util';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prisma: {
    cart: {
      findUnique: jest.Mock;
    };
    cartItem: {
      deleteMany: jest.Mock;
    };
    productVariant: {
      updateMany: jest.Mock;
    };
    order: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
    payment: {
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  let stripeService: {
    getClient: jest.Mock;
  };

  let mockStripeClient: {
    checkout: {
      sessions: {
        retrieve: jest.Mock;
        create: jest.Mock;
      };
    };
  };

  const validToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const cartId = '11111111-1111-1111-1111-111111111111';
  const orderId = '22222222-2222-2222-2222-222222222222';
  const variantId = '33333333-3333-3333-3333-333333333333';

  const mockAddress = {
    firstName: 'Jane',
    lastName: 'Doe',
    address1: '123 Cinnamon Lane',
    city: 'Portland',
    stateProvince: 'OR',
    postalCode: '97201',
    country: 'US',
  };

  const mockOrderDto = {
    email: 'jane@example.com',
    shippingAddress: mockAddress,
    billingAddress: mockAddress,
  };

  beforeEach(async () => {
    process.env.STOREFRONT_URL = 'http://localhost:3000';

    prisma = {
      cart: {
        findUnique: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
      productVariant: {
        updateMany: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      payment: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    mockStripeClient = {
      checkout: {
        sessions: {
          retrieve: jest.fn(),
          create: jest.fn(),
        },
      },
    };

    stripeService = {
      getClient: jest.fn().mockReturnValue(mockStripeClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: StripeService,
          useValue: stripeService,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  describe('createOrder', () => {
    it('throws NotFoundException for invalid token length', async () => {
      await expect(
        service.createOrder('invalid-token', mockOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if cart is not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder(validToken, mockOrderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws GoneException if cart has expired', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: cartId,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.createOrder(validToken, mockOrderDto),
      ).rejects.toThrow(GoneException);
    });

    it('throws BadRequestException if cart has no items', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: cartId,
        expiresAt: new Date(Date.now() + 10000),
        items: [],
      });

      await expect(
        service.createOrder(validToken, mockOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a pending order, decrements inventory, and clears cart', async () => {
      const mockCart = {
        id: cartId,
        currency: 'USD',
        expiresAt: new Date(Date.now() + 10000),
        items: [
          {
            variantId,
            quantity: 2,
            variant: {
              id: variantId,
              sku: 'CV-CIN-001',
              name: '100g Quill',
              stockQuantity: 10,
              isActive: true,
              product: {
                name: 'Ceylon Cinnamon',
                status: ProductStatus.ACTIVE,
              },
              prices: [{ currency: 'USD', amount: 1599 }],
            },
          },
        ],
      };

      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.productVariant.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.create.mockResolvedValue({
        id: orderId,
        orderNumber: 'CV-12345-ABCD',
        email: 'jane@example.com',
        currency: 'USD',
        subtotal: 3198,
        totalAmount: 3198,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      });

      const order = await service.createOrder(validToken, mockOrderDto);

      expect(prisma.productVariant.updateMany).toHaveBeenCalledWith({
        where: {
          id: variantId,
          isActive: true,
          stockQuantity: { gte: 2 },
          product: { status: ProductStatus.ACTIVE },
        },
        data: {
          stockQuantity: { decrement: 2 },
        },
      });
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId } });
      expect(order.id).toBe(orderId);
      expect(order.totalAmount).toBe(3198);
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('throws ConflictException if inventory cannot be reserved', async () => {
      const mockCart = {
        id: cartId,
        currency: 'USD',
        expiresAt: new Date(Date.now() + 10000),
        items: [
          {
            variantId,
            quantity: 5,
            variant: {
              id: variantId,
              sku: 'CV-CIN-001',
              name: '100g Quill',
              stockQuantity: 2, // only 2 available
              isActive: true,
              product: {
                name: 'Ceylon Cinnamon',
                status: ProductStatus.ACTIVE,
              },
              prices: [{ currency: 'USD', amount: 1599 }],
            },
          },
        ],
      };

      prisma.cart.findUnique.mockResolvedValue(mockCart);

      await expect(
        service.createOrder(validToken, mockOrderDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createPaymentSession', () => {
    it('throws NotFoundException if order does not exist or email does not match', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createPaymentSession(orderId, 'wrong@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if order status is cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        email: 'jane@example.com',
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.PENDING,
        items: [],
        payments: [],
      });

      await expect(
        service.createPaymentSession(orderId, 'jane@example.com'),
      ).rejects.toThrow(ConflictException);
    });

    it('returns existing session if an open session already exists for this order', async () => {
      const existingSessionId = 'cs_test_existing_123';
      const existingUrl = 'https://checkout.stripe.com/c/pay/cs_test_existing_123';

      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        orderNumber: 'CV-123',
        email: 'jane@example.com',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount: 1999,
        items: [{ lineTotal: 1999 }],
        payments: [
          {
            provider: PaymentProvider.STRIPE,
            idempotencyKey: `checkout-session-${orderId}`,
            providerPaymentId: existingSessionId,
          },
        ],
      });

      mockStripeClient.checkout.sessions.retrieve.mockResolvedValue({
        id: existingSessionId,
        status: 'open',
        url: existingUrl,
      });

      const result = await service.createPaymentSession(orderId, 'jane@example.com');

      expect(result.sessionId).toBe(existingSessionId);
      expect(result.checkoutUrl).toBe(existingUrl);
      expect(mockStripeClient.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('creates a new Stripe session when none exists', async () => {
      const newSessionId = 'cs_test_new_456';
      const newUrl = 'https://checkout.stripe.com/c/pay/cs_test_new_456';

      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        orderNumber: 'CV-123',
        email: 'jane@example.com',
        currency: 'USD',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount: 1999,
        items: [
          {
            productName: 'Cinnamon Sticks',
            variantName: '100g',
            sku: 'CV-STK-001',
            unitPrice: 1999,
            quantity: 1,
            lineTotal: 1999,
          },
        ],
        payments: [],
      });

      mockStripeClient.checkout.sessions.create.mockResolvedValue({
        id: newSessionId,
        url: newUrl,
      });

      prisma.payment.upsert.mockResolvedValue({});

      const result = await service.createPaymentSession(orderId, 'jane@example.com');

      expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalled();
      expect(prisma.payment.upsert).toHaveBeenCalled();
      expect(result.sessionId).toBe(newSessionId);
      expect(result.checkoutUrl).toBe(newUrl);
    });
  });
});
