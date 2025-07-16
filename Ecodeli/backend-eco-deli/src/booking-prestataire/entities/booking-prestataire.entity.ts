import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class BookingPrestataire {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule, { eager: true })
  @JoinColumn()
  schedule: Schedule;

  @Column({ type: 'varchar', default: 'prestataire' })
  role: 'prestataire';

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  client: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  provider: User;

  @Column({ default: 'en attente' }) // 'accepté' | 'refusé' | 'en attente'
  status: string;


}
