import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceItem } from "./invoice-item.entity";

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceNumber: string;

  @Column()
  issueDate: Date;

  @Column()
  paymentDate: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: string;

  @Column()
  paymentStatus: boolean;

  @Column()
  paymentMethod: string;

  @Column()
  serviceTitle: string;

  @Column()
  userType: string;

  @Column()
  userId: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
