
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AdminProductsController } from '../admin-products.controller';
import { AdminProductsService } from '../admin-products.service';
import { AdminVariantsController } from './admin-variants.controller';
import { AdminVariantsService } from './admin-variants.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminProductsController, AdminVariantsController],
  providers: [AdminProductsService, AdminVariantsService],
})
export class AdminProductsModule {}
