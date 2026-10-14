
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminVariantsController } from './dto/admin-variants.controller';
import { AdminVariantsService } from './dto/admin-variants.service';
import { AdminProductImagesController } from './admin-product-images.controller';
import { AdminProductImagesService } from './admin-product-images.service';
import { AdminInventoryController } from './admin-inventory.controller';
import { AdminInventoryService } from './admin-inventory.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminProductsController,
    AdminVariantsController,
    AdminProductImagesController,
    AdminInventoryController,
  ],
  providers: [
    AdminProductsService,
    AdminVariantsService,
    AdminProductImagesService,
    AdminInventoryService,
  ],
})
export class AdminProductsModule {}
