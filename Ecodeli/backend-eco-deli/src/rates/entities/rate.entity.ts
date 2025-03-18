import { User } from "src/users/entities/user.entity";
import { Column, Decimal128, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Rate {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    evaluatorType: string;
    
    @Column("decimal", { precision: 10, scale: 2 }) 
    rate: number;

    @Column()
    ratingComment: string;

    @Column()
    ratingDate: Date;

    @ManyToMany(() => User)
    @JoinTable({ name: "giveRating" })
    user: User[]
}
