import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
  DefaultValuePipe,
  ParseBoolPipe,
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
import { AdminInventoryService } from './admin-inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@ApiTags('Admin Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: AdminInventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List product variant inventory' })
  findAll(
    @Query(
      'lowStock',
      new DefaultValuePipe(false),
      ParseBoolPipe,
    )
    lowStock: boolean,
  ) {
    return this.inventoryService.findAll(lowStock);
  }

  @Patch('variants/:variantId')
  @ApiOperation({ summary: 'Update product variant inventory' })
  update(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(variantId, dto);
  }
}