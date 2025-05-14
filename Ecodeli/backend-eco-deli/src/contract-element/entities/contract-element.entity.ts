import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContractElement {    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Object: string;

    @Column({ nullable: true })
    contractId: number;

    @ManyToOne(() => User, (user) => user.companyDetail, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'usersId' }) 
    user: User; 
}
