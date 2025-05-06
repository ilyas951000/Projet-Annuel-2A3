import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  packageName: string;

  @Column('decimal', { precision: 10, scale: 2 })
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

  // Nouvel attribut pour le statut de livraison (ex: "pris en charge", "en transit", "livré")
  @Column({ default: 'en attente' })
  deliveryStatus: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'deliverPackage',
    joinColumn: {
      name: 'packageId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  users: User[]; 

  

  @ManyToOne(() => Advertisement, ad => ad.packages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advertisementId' })
  advertisement: Advertisement;

  @Column()
  advertisementId: number;
}
