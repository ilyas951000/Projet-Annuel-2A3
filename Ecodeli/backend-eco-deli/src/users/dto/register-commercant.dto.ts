import { IsEmail, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class RegisterCommercantDto {
  @IsString()
  @IsNotEmpty()
  userFirstName: string;

  @IsString()
  @IsNotEmpty()
  userLastName: string;
  
    @IsEmail()
@IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  userStatus: string = 'commercant';

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

  @IsDateString()
  @IsNotEmpty()
  startDateOfActivity: string;

  @IsString()
  @IsNotEmpty()
  registeredOfficeAddressStreet: string;

  @IsString()
  @IsNotEmpty()
  registeredOfficeAddressCity: string;

  @IsString()
  @IsNotEmpty()
  registeredOfficeAddressPostalCode: string;
}
