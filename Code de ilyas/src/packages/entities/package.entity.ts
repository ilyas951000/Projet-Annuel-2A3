import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Package {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    packageName: string;
    
    @Column("decimal", {precision:10, scale:2})
    packageWeight: number;

    @Column()
    packageDimension: string;

    @Column()
    packageDescription: string;

    @Column()
    senderAddress: string;

    @Column()
    recipientAddress: string;

    @Column()
    packageRequirements: string;
    
    @ManyToMany(()=>User)
    @JoinTable({name:"deliverPackage"})
    user: User[]
}
