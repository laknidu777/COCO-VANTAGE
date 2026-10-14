import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  variantId!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;

  @IsString()
  currency!: string;
}