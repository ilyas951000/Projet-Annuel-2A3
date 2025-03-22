import { Advertisement } from "src/advertisements/entities/advertisement.entity";
import { Contract } from "src/contracts/entities/contract.entity";
import { Invoice } from "src/invoices/entities/invoice.entity";
import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/documents/entities/document.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userLastName: string;

    @Column()
    userFirstName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 'client' })
    userStatus: string;

    @Column()
    userAddress: string;

    @Column({ default: false })
    hasAccount: boolean;

    @Column({ default: false })
    userInsurance: boolean;

    @Column({ default: false })
    occasionalCourier: boolean;

    @Column({ default: false })
    valid: boolean;

    @OneToMany(() => Subscription, (subscription) => subscription.users)
    subscription: Subscription[];

    @ManyToOne(() => Contract, (contract) => contract.users)
    contract: Contract;

    @ManyToOne(() => Advertisement, (advertisement) => advertisement.users)
    advertisement: Advertisement;

    @ManyToOne(() => Invoice, (invoice) => invoice.user)
    invoice: Invoice;

    @ManyToOne(() => Document, (document) => document.user)
    documents: Document;
}
