import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    documentType: string;
    
    @Column()
    documentDate: Date;

    @Column()
    format: string;

    @Column()
    expirationDate: Date;

    @OneToMany(() => User, (user) => user.documents)
    user: User[];


}
