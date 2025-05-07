
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePackageDto {
    @IsString()
    packageName: string;

    @IsNumber()
    packageQuantity: number;

    @IsNumber()
    packageWeight: number;

    @IsString()
    packageDimension: string;

    @IsString()
    packageDescription: string;

    @IsString()
      currentStreet: string;
    
    @IsString()
    currentCity: string;

    @IsNumber()
    currentPostalCode: number;

    @IsString()
    destinationStreet: string;

    @IsString()
    destinationCity: string;

    @IsNumber()
    destinationPostalCode: number;

}
