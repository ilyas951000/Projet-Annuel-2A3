import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocalisationDto {
    
    @IsOptional()
    @IsString()
    currentStreet: string;

    @IsOptional()
    @IsString()
    currentCity: string;

    @IsOptional()
    @IsString()
    currentPostalCode: string;

    @IsOptional()
    @IsString()
    destinationStreet: string;

    @IsOptional()
    @IsString()
    destinationCity: string;
    
    @IsOptional()
    @IsString()
    destinationPostalCode: string;
}