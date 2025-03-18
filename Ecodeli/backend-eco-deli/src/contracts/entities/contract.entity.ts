import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    startDate: Date;
    
    @Column()
    endDate: Date;

    @Column()
    contractStatus: string;

    @Column()
    contractPhoto: string;

    @Column()
    contractDescription: boolean;

    @OneToOne(() => User)
    @JoinColumn()
    user: User
}
