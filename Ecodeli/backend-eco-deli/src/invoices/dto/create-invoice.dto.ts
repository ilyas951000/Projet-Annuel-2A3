export class CreateInvoiceDto {
    invoiceNumber: number;
    issueDate: Date;
    paymentDate: Date;
    totalAmount: string;
    paymentStatus: boolean;
    paymentMethod: string;
    serviceTitle: string;
}
