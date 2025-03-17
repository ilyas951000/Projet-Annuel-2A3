import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    subscriptionTitle: string;
    
    @Column()
    packageInsurance: boolean;

    @Column()
    shippingDiscount: number;

    @Column()
    priorityShipping: number;

    @Column()
    permanentDiscount: number;

    @Column()
    supplement3000: boolean;
}
