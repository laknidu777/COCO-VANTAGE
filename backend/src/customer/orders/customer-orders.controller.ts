import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CustomerGuard } from '../../auth/guards/customer.guard';
import { CustomerOrdersService } from './customer-orders.service';
import { CustomerOrderQueryDto } from './dto/customer-order-query.dto';

interface AuthenticatedCustomerRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    type?: string;
  };
}

@ApiTags('Customer Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CustomerGuard)
@Controller('customer/orders')
export class CustomerOrdersController {
  constructor(private readonly service: CustomerOrdersService) {}

  @Get()
  @ApiOperation({
    summary: "List the authenticated customer's order history with pagination",
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of orders owned by the customer',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid customer JWT required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CUSTOMER role',
  })
  findAll(
    @Req() req: AuthenticatedCustomerRequest,
    @Query() query: CustomerOrderQueryDto,
  ) {
    return this.service.findAll(req.user.id, query.page, query.limit);
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Retrieve detailed information for a specific customer order',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns safe order details for the requested order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found (generic 404 prevents ownership disclosure)',
  })
  findOne(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.service.findOne(req.user.id, orderId);
  }
}
