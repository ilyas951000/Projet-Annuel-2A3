import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateMovementDto {
  @IsInt()
  userId: number;

  @IsString()
  city: string;

  @IsOptional()
  @IsBoolean()
  isOrigin?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  availableOn?: string;
}
