import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreatePrestataireRoleDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsOptional()
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @IsNumber()
  priceMax?: number;
}
