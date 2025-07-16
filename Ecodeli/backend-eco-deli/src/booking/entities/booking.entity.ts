import { Package } from "src/packages/entities/package.entity";
import { Schedule } from "src/schedules/entities/schedule.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule)
  @JoinColumn()
  schedule: Schedule;

  @Column({ type: 'varchar', default: 'livreur' })
    role: 'livreur' | 'prestataire';

  @ManyToOne(() => User)
  @JoinColumn()
  client: User;

  @ManyToOne(() => Package)
  @JoinColumn()
  package: Package;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  courier: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  provider: User;

  @Column({ default: 'en attente' }) // 'accepté' | 'refusé' | 'en attente'
  status: string;
}
