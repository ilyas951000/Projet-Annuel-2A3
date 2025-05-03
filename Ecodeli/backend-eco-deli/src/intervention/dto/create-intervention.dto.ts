import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInterventionDto {
  @IsNumber()
  prestataireId: number;

  @IsNumber()
  advertisementId: number;

  @IsString()
  type: string;

  @IsNumber()
  prix: number;

  @IsString()
  description: string;
}
