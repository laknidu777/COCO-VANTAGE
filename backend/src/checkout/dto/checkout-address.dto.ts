
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CheckoutAddressDto {
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @IsString()
  @Length(1, 100)
  lastName!: string;

  @IsString()
  @Length(1, 150)
  address1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  address2?: string;

  @IsString()
  @Length(1, 100)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateProvince?: string;

  @IsString()
  @Length(1, 20)
  postalCode!: string;

  @IsString()
  @Matches(/^[A-Za-z]{2}$/)
  country!: string;
}
