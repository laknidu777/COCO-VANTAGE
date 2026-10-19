import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { AdminProductsModule } from './admin/products/admin-products.module';
import { CartModule } from './cart/cart.module';
import { AdminOrdersModule } from './admin/orders/admin-orders.module';
import { CheckoutModule } from './checkout/checkout.module';
import { StripeModule } from './stripe/stripe.module';
import { CustomerOrdersModule } from './customer/orders/customer-orders.module';
import { AdminCustomersModule } from './admin/customers/admin-customers.module';
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    ProductsModule,
    CategoriesModule,
    AuthModule,
    AdminProductsModule,
    CartModule,
    AdminOrdersModule,
    AdminCustomersModule,
    CheckoutModule,
    StripeModule,
    CustomerOrdersModule,
  ],
})
export class AppModule { }
