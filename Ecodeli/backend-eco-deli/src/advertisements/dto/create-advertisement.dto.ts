
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdvertisementDto {
  @IsOptional()
  @IsString()
  advertisementPhoto?: string;


  @IsNotEmpty()
  publicationDate: Date;

  @IsString()
  @IsOptional()
  additionalInformation?: string;

  @IsNumber()
  advertisementPrice: number;

  @IsString()
  creatorRole: string;

  @IsString()
  advertisementStatus: string;

  @IsNumber()
  usersId: number;
  
  @IsOptional()
  @IsArray()
  packages?: Array<{
    quantity: number;
    item: string;
    dimension?: string;
    weight?: number;
  }>;
}
