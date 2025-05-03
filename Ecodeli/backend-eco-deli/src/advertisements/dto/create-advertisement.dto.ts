// dto/create-advertisement.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdvertisementDto {
  @IsOptional()
  @IsString()
  advertisementPhoto?: string;

  @IsNumber()
  advertisementQuantity: number;

  @IsString()
  advertisementItem: string;

  @IsNotEmpty()
  publicationDate: Date;

  @IsString()
  advertisementDimension: string;

  @IsNumber()
  advertisementWeight: number;

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
  usersId: number;     // ← on conserve ce champ pour recevoir l’ID depuis le controller
}
