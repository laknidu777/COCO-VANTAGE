
import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma, ProductStatus,PaymentProvider } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { hashCartToken } from '../cart/cart-token.util';
import { CreateOrderDto } from './dto/create-order.dto';
// import { PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class CheckoutService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly stripeService: StripeService,
) {}

  async createOrder(
    token: string,
    dto: CreateOrderDto,
    userId?: string | null,
  ) {
    if (!token || token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
      throw new NotFoundException('Cart not found.');
    }

    const email = dto.email.trim().toLowerCase();

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const cart = await tx.cart.findUnique({
            where: { tokenHash: hashCartToken(token) },
            include: {
              items: {
                include: {
                  variant: {
                    include: {
                      product: true,
                      prices: true,
                    },
                  },
                },
              },
            },
          });

          if (!cart) {
            throw new NotFoundException('Cart not found.');
          }

          if (cart.expiresAt <= new Date()) {
            throw new GoneException(
              'This cart has expired. Please create a new cart.',
            );
          }

          if (cart.items.length === 0) {
            throw new BadRequestException(
              'Your cart is empty.',
            );
          }

          let subtotal = 0;

          const orderItems = cart.items.map((item) => {
            const variant = item.variant;

            if (
              !variant.isActive ||
              variant.product.status !== ProductStatus.ACTIVE
            ) {
              throw new BadRequestException(
                `Product variant ${variant.sku} is no longer available.`,
              );
            }

            const price = variant.prices.find(
              (entry) => entry.currency === cart.currency,
            );

            if (!price) {
              throw new BadRequestException(
                `Variant ${variant.sku} has no price in ${cart.currency}.`,
              );
            }

            if (variant.stockQuantity < item.quantity) {
              throw new ConflictException(
                `Insufficient stock for ${variant.sku}.`,
              );
            }

            const lineTotal = price.amount * item.quantity;

            if (!Number.isSafeInteger(lineTotal)) {
              throw new BadRequestException(
                'An order line total is invalid.',
              );
            }

            subtotal += lineTotal;

            return {
              variantId: variant.id,
              productName: variant.product.name,
              variantName: variant.name,
              sku: variant.sku,
              unitPrice: price.amount,
              quantity: item.quantity,
              lineTotal,
            };
          });

          if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
            throw new BadRequestException(
              'The order subtotal is invalid.',
            );
          }

          // Reserve inventory using conditional atomic updates.
          // If any update fails, the entire transaction rolls back.
          for (const item of orderItems) {
            const result = await tx.productVariant.updateMany({
              where: {
                id: item.variantId,
                isActive: true,
                stockQuantity: { gte: item.quantity },
                product: { status: ProductStatus.ACTIVE },
              },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });

            if (result.count !== 1) {
              throw new ConflictException(
                `Stock changed during checkout for ${item.sku}. Please review your cart.`,
              );
            }
          }

          // Shipping and tax remain zero until their real calculation
          // rules are implemented. Prices are always read from the DB.
          const shippingAmount = 0;
          const taxAmount = 0;
          const discountAmount = 0;
          const totalAmount =
            subtotal + shippingAmount + taxAmount - discountAmount;

          const order = await tx.order.create({
            data: {
              userId: userId ?? null,
              orderNumber: `CV-${Date.now()}-${randomUUID()
                .slice(0, 8)
                .toUpperCase()}`,
              email,
              phone: dto.phone?.trim() || null,
              currency: cart.currency,
              subtotal,
              shippingAmount,
              taxAmount,
              discountAmount,
              totalAmount,
              status: OrderStatus.PENDING,
              paymentStatus: PaymentStatus.PENDING,
              shippingAddress: {
                ...dto.shippingAddress,
                } as Prisma.InputJsonValue,
                billingAddress: {
                ...dto.billingAddress,
                } as Prisma.InputJsonValue,
              customerNote: dto.customerNote?.trim() || null,
              items: {
                create: orderItems,
              },
            },
            select: {
              id: true,
              orderNumber: true,
              email: true,
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

          // Clear the cart only within the successful order transaction.
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });

          return order;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 15000,
        },
      );
    } catch (error) {
      // Serializable transactions can fail under concurrent load.
      // Return a safe retry response instead of exposing DB details.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Checkout encountered a concurrent update. Please retry.',
        );
      }

      throw error;
    }
  }
  
async createPaymentSession(orderId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
    },
  });

  // Avoid revealing whether an order exists for another email.
  if (!order || order.email.toLowerCase() !== normalizedEmail) {
    throw new NotFoundException('Order not found.');
  }

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    throw new ConflictException('This order cannot be paid.');
  }

  if (order.paymentStatus !== PaymentStatus.PENDING) {
    throw new ConflictException(
      'This order is not awaiting payment.',
    );
  }

  if (order.totalAmount <= 0 || order.items.length === 0) {
    throw new BadRequestException('The order cannot be paid.');
  }

  // This implementation supports the current checkout totals,
  // where shipping, tax and discounts are zero.
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  );

  if (itemsTotal !== order.totalAmount) {
    throw new ConflictException(
      'Order totals do not match the payment items.',
    );
  }

  const stripe = this.stripeService.getClient();

  const storefrontUrl =
    process.env.STOREFRONT_URL || process.env.FRONTEND_URL;

  if (!storefrontUrl) {
    throw new Error('STOREFRONT_URL or FRONTEND_URL is missing.');
  }

  let baseUrl: string;

  try {
    const parsedUrl = new URL(storefrontUrl);

    if (
      parsedUrl.protocol !== 'http:' &&
      parsedUrl.protocol !== 'https:'
    ) {
      throw new Error('Invalid protocol.');
    }

    baseUrl = parsedUrl.origin;
  } catch {
    throw new Error('STOREFRONT_URL is invalid.');
  }

  const idempotencyKey = `checkout-session-${order.id}`;

  const existingPayment = order.payments.find(
    (payment) =>
      payment.provider === PaymentProvider.STRIPE &&
      payment.idempotencyKey === idempotencyKey,
  );

  if (existingPayment?.providerPaymentId) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      existingPayment.providerPaymentId,
    );

    if (existingSession.status === 'open' && existingSession.url) {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: existingSession.url,
        sessionId: existingSession.id,
      };
    }

    if (existingSession.status === 'complete') {
      throw new ConflictException(
        'This payment session has already been completed.',
      );
    }

    throw new ConflictException(
      'This payment session has expired. Payment-session recovery is not implemented yet.',
    );
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: item.unitPrice,
          product_data: {
            name: `${item.productName} - ${item.variantName}`,
            metadata: {
              sku: item.sku,
            },
          },
        },
      })),
      success_url:
        `${baseUrl}/checkout/success` +
        '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:
        `${baseUrl}/checkout/cancel` +
        `?order_id=${encodeURIComponent(order.id)}`,
    },
    {
      idempotencyKey,
    },
  );

  if (!session.url) {
    throw new ConflictException(
      'Stripe did not return a checkout URL.',
    );
  }

  await this.prisma.payment.upsert({
    where: {
      idempotencyKey,
    },
    create: {
      orderId: order.id,
      provider: PaymentProvider.STRIPE,
      providerPaymentId: session.id,
      amount: order.totalAmount,
      currency: order.currency,
      status: PaymentStatus.PENDING,
      idempotencyKey,
    },
    update: {
      providerPaymentId: session.id,
    },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

}
