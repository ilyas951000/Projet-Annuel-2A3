import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
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
  packageQuantity: number;

  @Column()
  packageDimension: string;

  @Column()
  packageDescription: string;

  @Column()
  currentStreet: string;

  @Column()
  currentCity: string;

  @Column()
  currentPostalCode: number;

  @Column()
  destinationStreet: string;

  @Column()
  destinationCity: string;

  @Column()
  destinationPostalCode: number;


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

  @OneToMany(() => Localisation, loc => loc.package, { cascade: true })
  localisations: Localisation[];


  @Column()
  advertisementId: number;
}
