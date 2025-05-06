
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePackageDto {
    @IsString()
    packageName: string;
    @IsNumber()
    packageWeight: number;
    @IsString()
    packageDimension: string;
    @IsString()
    packageDescription: string;
    @IsString()
    senderAddress: string;
    @IsString()
    recipientAddress: string;
    @IsString()
    packageRequirements: string;
}
