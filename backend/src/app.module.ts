import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module'; 
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule, ProductsModule, CategoriesModule],
})
export class AppModule {}
