import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subscriptionTitle: string;

  @Column()
  packageInsurance: boolean;

  @Column()
  shippingDiscount: number;

  @Column()
  priorityShipping: number;

  @Column()
  permanentDiscount: number;

  @Column()
  supplement3000: boolean;

  @Column({ default: false })
  hasUsedFreeShipping: boolean;


  @ManyToOne(() => User, (user) => user.subscription, { nullable: false, eager: true })
  users: User;
}
