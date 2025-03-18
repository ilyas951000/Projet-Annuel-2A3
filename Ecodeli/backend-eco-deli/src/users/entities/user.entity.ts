
import { Advertisement } from "src/advertisements/entities/advertisement.entity";
import { Contract } from "src/contracts/entities/contract.entity";
import { Invoice } from "src/invoices/entities/invoice.entity";
import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "src/documents/entities/document.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    userLastName: string;
    
    @Column()
    userFirstName: string;

    @Column()
    userAddress: string;

    @Column()
    userStatus: string;

    @Column()
    hasAccount: boolean;

    @Column()
    userInsurance: boolean;

    @Column()
    occasionalCourier: boolean;

    @Column()
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


