import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminCustomersService } from './admin-customers.service';
import { GetCustomersQueryDto } from './dto/get-customers-query.dto';
import { UpdateCustomerStatusDto } from './dto/update-customer-status.dto';

@ApiTags('Admin Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly service: AdminCustomersService) {}

  @Get()
  @ApiOperation({
    summary: 'List customers with pagination, search, and aggregate metrics',
  })
  findAll(@Query() query: GetCustomersQueryDto) {
    return this.service.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Get comprehensive customer profile, order history, and addresses',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update customer active / suspended status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerStatusDto,
  ) {
    return this.service.updateStatus(id, dto.isActive);
  }
}
