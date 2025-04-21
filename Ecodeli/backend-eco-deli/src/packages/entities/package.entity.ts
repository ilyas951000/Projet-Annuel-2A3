import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

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
  users: User[]; // Même si un seul, TypeORM exige un tableau pour ManyToMany
}
