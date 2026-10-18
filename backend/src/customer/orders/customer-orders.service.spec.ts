import { NotFoundException } from '@nestjs/common';
import { CustomerOrdersService } from './customer-orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CustomerOrdersService', () => {
  let service: CustomerOrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn(),
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = mockPrisma as unknown as PrismaService;
    service = new CustomerOrdersService(prisma);
  });

  describe('findAll', () => {
    it('returns empty result when customer has no orders', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findAll('user-123', 1, 10);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('returns formatted orders owned strictly by the customer', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'CV-1001',
          currency: 'USD',
          subtotal: 3500,
          shippingAmount: 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 3500,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          createdAt: new Date('2026-10-18T10:00:00Z'),
          items: [
            {
              id: 'item-1',
              productName: 'Ceylon Silver Charcoal',
              variantName: '500g',
              sku: 'CSC-500',
              unitPrice: 3500,
              quantity: 1,
              lineTotal: 3500,
            },
          ],
        },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockOrders, 1]);

      const result = await service.findAll('user-123', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('order-1');
      expect(result.data[0].itemsCount).toBe(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('sanitizes invalid or negative pagination inputs', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll('user-123', -5, 200);

      // Verify transaction received safe bounds
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50, // max limit capped at 50
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns order details for an order owned by the customer', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'CV-1001',
        email: 'customer@example.com',
        phone: '+15551234567',
        currency: 'USD',
        subtotal: 3500,
        shippingAmount: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 3500,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress: { city: 'New York', country: 'US' },
        billingAddress: { city: 'New York', country: 'US' },
        customerNote: 'Fragile delivery please',
        createdAt: new Date('2026-10-18T10:00:00Z'),
        updatedAt: new Date('2026-10-18T10:00:00Z'),
        items: [
          {
            id: 'item-1',
            productName: 'Ceylon Silver Charcoal',
            variantName: '500g',
            sku: 'CSC-500',
            unitPrice: 3500,
            quantity: 1,
            lineTotal: 3500,
          },
        ],
      };

      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne('user-123', 'order-1');

      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-1', userId: 'user-123' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockOrder);
    });

    it('throws generic NotFoundException when order does not exist', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-123', 'non-existent-order')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws generic NotFoundException when order belongs to a different customer (ownership isolation)', async () => {
      // If order belongs to user-456, query with userId: user-123 will find nothing
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-123', 'order-owned-by-user-456')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: { id: 'order-owned-by-user-456', userId: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('ensures internal secrets and admin notes are not selected in query projection', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'CV-1001',
      });

      await service.findOne('user-123', 'order-1');

      const selectArg = mockPrisma.order.findFirst.mock.calls[0][0].select;
      // Sensitive fields must not be selected
      expect(selectArg.payments).toBeUndefined();
      expect(selectArg.stripeClientSecret).toBeUndefined();
      expect(selectArg.webhookSecret).toBeUndefined();
    });
  });
});
