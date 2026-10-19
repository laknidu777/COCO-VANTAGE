import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface ShippingAddressJson {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface AdminCustomerSummary {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  location: string | null;
  isActive: boolean;
  role: string;
  createdAt: Date;
  ordersCount: number;
  totalSpent: number; // in cents
  lastOrderAt: Date | null;
}

export interface AdminCustomerDetail {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  metrics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    firstOrderAt: Date | null;
    lastOrderAt: Date | null;
  };
  primaryAddress: ShippingAddressJson | null;
  savedAddresses: ShippingAddressJson[];
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    status: string;
    paymentStatus: string;
    createdAt: Date;
    itemsCount: number;
    items: Array<{
      productName: string;
      variantName: string;
      sku: string;
      quantity: number;
      lineTotal: number;
    }>;
  }>;
}

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to parse customer display name from shipping address or email.
   */
  private extractCustomerName(
    address: unknown,
    email: string,
  ): string {
    if (address && typeof address === 'object') {
      const addr = address as ShippingAddressJson;
      const parts = [addr.firstName, addr.lastName].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(' ').trim();
      }
    }
    const namePart = email.split('@')[0] || 'Customer';
    return namePart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Helper to extract location (City, Country) from shipping address.
   */
  private extractLocation(address: unknown): string | null {
    if (address && typeof address === 'object') {
      const addr = address as ShippingAddressJson;
      const parts = [addr.city, addr.country].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    return null;
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 20;

    const trimmedSearch = search?.trim().toLowerCase();

    // Base user filter: Customer accounts only
    const where: Prisma.UserWhereInput = {
      role: UserRole.CUSTOMER,
      ...(trimmedSearch
        ? {
            OR: [
              { email: { contains: trimmedSearch, mode: 'insensitive' } },
              {
                orders: {
                  some: {
                    OR: [
                      { email: { contains: trimmedSearch, mode: 'insensitive' } },
                      { phone: { contains: trimmedSearch, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [users, total, allCustomersCount, activeCustomersCount, allPaidOrders] =
      await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
          include: {
            orders: {
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                totalAmount: true,
                paymentStatus: true,
                status: true,
                phone: true,
                shippingAddress: true,
                createdAt: true,
              },
            },
          },
        }),
        this.prisma.user.count({ where }),
        this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
        this.prisma.user.count({
          where: { role: UserRole.CUSTOMER, isActive: true },
        }),
        this.prisma.order.findMany({
          where: {
            user: { role: UserRole.CUSTOMER },
            paymentStatus: 'PAID',
          },
          select: {
            totalAmount: true,
            userId: true,
          },
        }),
      ]);

    // Aggregate statistics across customer base
    const totalRevenue = allPaidOrders.reduce(
      (acc, ord) => acc + (ord.totalAmount || 0),
      0,
    );

    // Calculate count of repeat buyers (placed >= 2 orders)
    const userOrderFrequency: Record<string, number> = {};
    for (const ord of allPaidOrders) {
      if (ord.userId) {
        userOrderFrequency[ord.userId] =
          (userOrderFrequency[ord.userId] || 0) + 1;
      }
    }
    const repeatCustomersCount = Object.values(userOrderFrequency).filter(
      (cnt) => cnt >= 2,
    ).length;

    // Transform user entities to customer summaries
    const customers: AdminCustomerSummary[] = users.map((user) => {
      const orders = user.orders || [];
      const ordersCount = orders.length;

      // Calculate total spent from all non-cancelled/paid orders
      const totalSpent = orders.reduce((sum, ord) => {
        if (ord.status !== 'CANCELLED' && ord.paymentStatus === 'PAID') {
          return sum + (ord.totalAmount || 0);
        }
        return sum;
      }, 0);

      // Latest order holds freshest shipping address & phone
      const latestOrder = orders[0];
      const name = latestOrder
        ? this.extractCustomerName(latestOrder.shippingAddress, user.email)
        : this.extractCustomerName(null, user.email);
      const location = latestOrder
        ? this.extractLocation(latestOrder.shippingAddress)
        : null;
      const phone = latestOrder?.phone || null;
      const lastOrderAt = latestOrder?.createdAt || null;

      return {
        id: user.id,
        email: user.email,
        name,
        phone,
        location,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
        ordersCount,
        totalSpent,
        lastOrderAt,
      };
    });

    return {
      data: customers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
      stats: {
        totalCustomers: allCustomersCount,
        activeCustomers: activeCustomersCount,
        totalRevenue,
        repeatCustomers: repeatCustomersCount,
      },
    };
  }

  async findOne(id: string): Promise<AdminCustomerDetail> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new NotFoundException('Customer not found');
    }

    const orders = user.orders || [];
    const totalOrders = orders.length;

    const paidOrders = orders.filter(
      (o) => o.status !== 'CANCELLED' && o.paymentStatus === 'PAID',
    );
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue =
      paidOrders.length > 0 ? Math.round(totalSpent / paidOrders.length) : 0;

    const firstOrderAt =
      orders.length > 0 ? orders[orders.length - 1].createdAt : null;
    const lastOrderAt = orders.length > 0 ? orders[0].createdAt : null;

    // Collect all unique shipping addresses across customer's orders
    const addressMap = new Map<string, ShippingAddressJson>();
    let primaryAddress: ShippingAddressJson | null = null;
    let customerPhone: string | null = null;

    for (const ord of orders) {
      if (ord.phone && !customerPhone) {
        customerPhone = ord.phone;
      }

      if (ord.shippingAddress && typeof ord.shippingAddress === 'object') {
        const addr = ord.shippingAddress as ShippingAddressJson;
        const key = `${addr.address1 || ''}-${addr.city || ''}-${addr.postalCode || ''}-${addr.country || ''}`.toLowerCase();
        if (key.length > 4 && !addressMap.has(key)) {
          addressMap.set(key, addr);
          if (!primaryAddress) {
            primaryAddress = addr;
          }
        }
      }
    }

    const name = primaryAddress
      ? this.extractCustomerName(primaryAddress, user.email)
      : this.extractCustomerName(null, user.email);

    return {
      id: user.id,
      email: user.email,
      name,
      phone: customerPhone,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      metrics: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        firstOrderAt,
        lastOrderAt,
      },
      primaryAddress,
      savedAddresses: Array.from(addressMap.values()),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount,
        currency: o.currency,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        itemsCount: o.items.length,
        items: o.items.map((item) => ({
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      })),
    };
  }

  async updateStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new NotFoundException('Customer not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
