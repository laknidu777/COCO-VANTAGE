import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module'; 
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule, ProductsModule, CategoriesModule, AuthModule],
})
export class AppModule {}
