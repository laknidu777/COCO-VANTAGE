
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
import { JwtService } from '@nestjs/jwt';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly jwtService: JwtService,
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
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: CreateOrderDto,
  ) {
    let customerUserId: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwtToken = authHeader.slice(7).trim();
      try {
        const payload = this.jwtService.verify(jwtToken);
        if (payload && payload.role === 'CUSTOMER' && payload.sub) {
          customerUserId = payload.sub;
        }
      } catch {
        // Fall back gracefully to guest checkout if token is invalid or expired
      }
    }
    return this.checkoutService.createOrder(token ?? '', dto, customerUserId);
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

