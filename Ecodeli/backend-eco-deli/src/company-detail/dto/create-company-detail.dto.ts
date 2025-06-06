import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCompanyDetailDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  legalStructure: string;

  @IsString()
  @IsNotEmpty()
  siren: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfIncorporation: string;

  @IsString()
  @IsNotEmpty()
  registeredOfficeAddressStreet: string;

  @IsString()
  @IsNotEmpty()
  registeredOfficeAddressCity: string;

  @IsString()
  @IsNotEmpty()
  registeredOfficeAddressPostalCode: string;

  @IsDateString()
  @IsNotEmpty()
  startDateOfActivity: string;

  @IsString()
  @IsNotEmpty()
  currentYear: string;

  @IsOptional()
  @IsNumber()
  usersId?: number;
}
