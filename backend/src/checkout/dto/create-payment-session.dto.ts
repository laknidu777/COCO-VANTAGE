
import { IsEmail, MaxLength } from 'class-validator';

export class CreatePaymentSessionDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
