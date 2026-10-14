import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new anonymous shopping cart' })
  create(@Query('currency') currency?: string) {
    return this.cartService.create(currency);
  }

  @Get()
  @ApiHeader({
    name: 'X-Cart-Token',
    required: true,
    description: 'Secret token returned when the cart was created',
  })
  @ApiOperation({ summary: 'Get the current shopping cart' })
  getCart(@Headers('x-cart-token') token?: string) {
    return this.cartService.getCart(token ?? '');
  }

  @Post('items')
  @ApiHeader({ name: 'X-Cart-Token', required: true })
  @ApiOperation({ summary: 'Add a variant to the shopping cart' })
  addItem(
    @Headers('x-cart-token') token: string | undefined,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(token ?? '', dto);
  }

  @Patch('items/:itemId')
  @ApiHeader({ name: 'X-Cart-Token', required: true })
  @ApiOperation({ summary: 'Update a cart item quantity' })
  updateItem(
    @Headers('x-cart-token') token: string | undefined,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(token ?? '', itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiHeader({ name: 'X-Cart-Token', required: true })
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeItem(
    @Headers('x-cart-token') token: string | undefined,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(token ?? '', itemId);
  }

  @Delete('items')
  @ApiHeader({ name: 'X-Cart-Token', required: true })
  @ApiOperation({ summary: 'Remove all items from the cart' })
  clearCart(@Headers('x-cart-token') token: string | undefined) {
    return this.cartService.clearCart(token ?? '');
  }
}