// favorite.entity.ts

import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Package } from 'src/packages/entities/package.entity';

@Entity()
@Unique(['user', 'package'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Package, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packageId' })
  package: Package;

  @CreateDateColumn()
  createdAt: Date;
}
