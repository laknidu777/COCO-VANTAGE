import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  currency: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  itemsCount: number;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export interface CustomerOrderDetail {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  currency: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: unknown;
  billingAddress: unknown;
  customerNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export interface CustomerOrdersPaginatedResponse {
  data: CustomerOrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class CustomerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves a paginated list of orders strictly owned by the authenticated customer.
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CustomerOrdersPaginatedResponse> {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(50, Math.max(1, Math.floor(limit)))
      : 10;

    const where = { userId };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        select: {
          id: true,
          orderNumber: true,
          currency: true,
          subtotal: true,
          shippingAmount: true,
          taxAmount: true,
          discountAmount: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              sku: true,
              unitPrice: true,
              quantity: true,
              lineTotal: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const formattedOrders: CustomerOrderSummary[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      currency: order.currency,
      subtotal: order.subtotal,
      shippingAmount: order.shippingAmount,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      itemsCount: order.items.length,
      items: order.items,
    }));

    return {
      data: formattedOrders,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
      },
    };
  }

  /**
   * Retrieves full details for a single order strictly owned by the authenticated customer.
   * Throws generic NotFoundException (404) if the order does not exist OR belongs to another user.
   */
  async findOne(userId: string, orderId: string): Promise<CustomerOrderDetail> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        phone: true,
        currency: true,
        subtotal: true,
        shippingAmount: true,
        taxAmount: true,
        discountAmount: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        shippingAddress: true,
        billingAddress: true,
        customerNote: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            sku: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
    });

    if (!order) {
      // Prevents leaking the existence of other users' orders
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
