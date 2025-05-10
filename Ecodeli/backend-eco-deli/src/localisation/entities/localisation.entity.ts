import { Package } from "src/packages/entities/package.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Localisation {
  @PrimaryGeneratedColumn() 
  id: number;
  @Column() 
  currentStreet: string;
  @Column() 
  currentCity:   string;
  @Column() 
  currentPostalCode: number;
  @Column() 
  destinationStreet: string;
  @Column() 
  destinationCity:   string;
  @Column() 
  destinationPostalCode: number;


  @ManyToOne(() => Package, pkg => pkg.localisations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packageId' })
  package: Package;

  @Column() packageId: number;

  toJSON() {
    const { package: pkg, ...rest } = this;
    return rest;
  }
}
