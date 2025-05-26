import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Advertisement } from 'src/advertisements/entities/advertisement.entity'
import { Package } from 'src/packages/entities/package.entity'

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  reason: string

  @Column({ default: 'en_attente' })
  status: string

  @ManyToOne(() => Advertisement, { nullable: true })
  advertisement: Advertisement

  @ManyToOne(() => Package, { nullable: true })
  package: Package
}
