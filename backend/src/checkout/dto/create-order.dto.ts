
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CheckoutAddressDto } from './checkout-address.dto';

export class CreateOrderDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  shippingAddress!: CheckoutAddressDto;

  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  billingAddress!: CheckoutAddressDto;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  customerNote?: string;
}
