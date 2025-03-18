export class CreatePackageDto {
    id: number;
    packageName: string;
    packageWeight: number;
    packageDimension: string;
    packageDescription: string;
    senderAddress: string;
    recipientAddress: string;
    packageRequirements: string;
}
