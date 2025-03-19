import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    invoiceNumber: number;
    
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

    @OneToMany(() => User, (user) => user.invoice)
    user: User[];
}
