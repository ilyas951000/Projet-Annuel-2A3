import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Advertisement {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    advertisementPhoto: string;
    
    @Column()
    advertisementQuantity: number;

    @Column()
    advertisementItem: string;

    @Column()
    publicationDate: Date;

    @Column()
    advertisementDimension: string;

    @Column("decimal",{precision:10, scale:2})
    advertisementWeight: number;

    @Column()
    additionalInformation: string;

    @Column("decimal",{precision:10, scale:2})
    advertisementPrice: number;

    @Column()
    creatorRole: string;

    @Column()
    advertisementStatus: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User

}
