
import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToOne(() => Subscription)
    @JoinColumn()
    subscription: Subscription
    
}


