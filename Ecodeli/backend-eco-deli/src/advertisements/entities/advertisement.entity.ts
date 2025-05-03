import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Advertisement {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: true })
    advertisementPhoto: string;
    
    @Column({ nullable: true })
    advertisementQuantity: number;

    @Column({ nullable: true })
    advertisementItem: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
      })
    publicationDate: Date;

    @Column({ nullable: true })
    advertisementDimension: string;

    @Column("decimal",{precision:10, scale:2})
    @Column({ nullable: true })
    advertisementWeight: number;

    @Column({ nullable: true })
    additionalInformation: string;

    @Column("decimal",{precision:10, scale:2})
    @Column({ nullable: true })
    advertisementPrice: number;

    @Column({ nullable: true })
    creatorRole: string;

    @Column({ nullable: true })
    advertisementStatus: string;

    @Column({ default: false })
    isValidated: boolean;

    @ManyToOne(() => User, (user) => user.advertisement)
    users: User;
}
