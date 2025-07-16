import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'providerId' }) // lie provider <-> providerId
  provider: User;

  @ManyToOne(() => User, { eager: true })
  client: User;

  @Column('int')
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed' | 'paid' | 'attente de valider';

  @Column({ default: false })
  isValidatedByClient: boolean;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ type: 'int', nullable: true })
  packageId: number | null;
  


}
