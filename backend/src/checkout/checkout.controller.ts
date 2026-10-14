
import {
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Param, ParseUUIDPipe } from '@nestjs/common';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
  ) {}

  @Post('orders')
  @ApiHeader({
    name: 'X-Cart-Token',
    required: true,
    description: 'Secret token returned when the guest cart was created',
  })
  @ApiOperation({
    summary: 'Create a pending order from the current shopping cart',
  })
  createOrder(
    @Headers('x-cart-token') token: string | undefined,
    @Body() dto: CreateOrderDto,
  ) {
    return this.checkoutService.createOrder(token ?? '', dto);
  }

  @Post('orders/:orderId/payment-session')
  @ApiOperation({
    summary: 'Create or retrieve a Stripe Checkout Session for an order',
  })
  createPaymentSession(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CreatePaymentSessionDto,
  ) {
    return this.checkoutService.createPaymentSession(
      orderId,
      dto.email,
    );
  }

}

