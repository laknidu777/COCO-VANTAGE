import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters.' })
  email!: string;

  @IsString({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must contain at least 8 characters.' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters.' })
  password!: string;
}
