export class CreateDocumentDto {
    id: number;
    documentType: string;
    documentDate: Date;
    format: string;
    expirationDate: Date;
}
