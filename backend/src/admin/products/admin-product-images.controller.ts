
import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminProductImagesService } from './admin-product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';

@ApiTags('Admin Product Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products/:productId/images')
export class AdminProductImagesController {
  constructor(private readonly service: AdminProductImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Add an image to a product or variant' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.service.create(productId, dto);
  }

  @Delete(':imageId')
  @ApiOperation({ summary: 'Delete a product image record' })
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.service.remove(productId, imageId);
  }
}
