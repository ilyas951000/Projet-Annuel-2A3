import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateLocalisationDto {
    @IsString()
    @IsNotEmpty()
    currentStreet: string;

    @IsString()
    @IsNotEmpty()
    currentCity: string;

    @IsString()
    @IsNotEmpty()
    currentPostalCode: string;

    @IsString()
    @IsNotEmpty()
    destinationStreet: string;

    @IsString()
    @IsNotEmpty()
    destinationCity: string;

    @IsString()
    @IsNotEmpty()
    destinationPostalCode: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsDateString()
    date: string; 
}