import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const safePage = Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1;

    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 20;

    let orderStatus: OrderStatus | undefined;

    if (status !== undefined) {
      if (
        !Object.values(OrderStatus).includes(status as OrderStatus)
      ) {
        throw new BadRequestException('Invalid order status');
      }

      orderStatus = status as OrderStatus;
    }

    const where = orderStatus ? { status: orderStatus } : {};

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, nextStatus: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [
          OrderStatus.CONFIRMED,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.CONFIRMED]: [
          OrderStatus.PROCESSING,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.REFUNDED]: [],
      };

      if (order.status === nextStatus) {
        throw new BadRequestException(
          'Order already has this status',
        );
      }

      if (
        !allowedTransitions[order.status].includes(nextStatus)
      ) {
        throw new BadRequestException(
          `Cannot change order status from ${order.status} to ${nextStatus}`,
        );
      }

      if (
        nextStatus === OrderStatus.CANCELLED &&
        order.paymentStatus === PaymentStatus.PAID
      ) {
        throw new ConflictException(
          'A paid order cannot be cancelled through this endpoint. Implement the refund and inventory workflow first.',
        );
      }

      // Compare the current status to avoid overwriting a
      // concurrent update from another administrator.
      const result = await tx.order.updateMany({
        where: {
          id,
          status: order.status,
        },
        data: {
          status: nextStatus,
        },
      });

      if (result.count !== 1) {
        throw new ConflictException(
          'Order changed concurrently. Reload it and try again.',
        );
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: {
          items: true,
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }
}