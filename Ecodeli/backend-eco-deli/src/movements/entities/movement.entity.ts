import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Movement {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    movementDate: Date;
    
    @Column()
    movementDescription: string;

    @ManyToMany(() => User)
    @JoinTable({ name: "courierMovement" })
    user: User[]
}
