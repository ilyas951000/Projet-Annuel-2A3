import { IsIn, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsOptional()
  scheduleId: number;

  @IsInt()
  @IsOptional()
  clientId: number;

  @IsInt()
  @IsOptional()
  packageId: number;

  @IsInt()
  @IsOptional()
  courierId?: number;

  @IsInt()
  @IsOptional()
  providerId?: number;

  @IsString()
  @IsIn(['livreur', 'prestataire'])
  @IsOptional()
  role?: 'livreur' | 'prestataire';
}
