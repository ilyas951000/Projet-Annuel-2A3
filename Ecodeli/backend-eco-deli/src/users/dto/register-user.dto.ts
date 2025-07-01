import { IsOptional, IsNumber, ValidateIf } from 'class-validator';

export class RegisterUserDto {
  userFirstName: string;
  userLastName: string;
  email: string;
  password: string;
  userStatus: string;
  userAddress: string;

  @ValidateIf((o) => o.userStatus === 'prestataire')
  @IsNumber()
  prestataireRoleId: number;
}
