import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Virement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  provider: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  stripePayoutId: string;

  @CreateDateColumn()
  createdAt: Date;
}
