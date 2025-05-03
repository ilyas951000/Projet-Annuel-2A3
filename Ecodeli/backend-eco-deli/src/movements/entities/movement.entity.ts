import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  /** référence utilisateur */
  @Column()
  userId: number;

  /** ville choisie */
  @Column()
  city: string;

  /** indique la ville d'origine (exactement une active à la fois) */
  @Column({ default: false })
  isOrigin: boolean;

  /** actif/inactif (toggle) */
  @Column({ default: true })
  active: boolean;

  /** note libre */
  @Column({ type: 'text', nullable: true })
  note?: string;

  /** prévue pour une date précise */
  @Column({ type: 'date', nullable: true })
  availableOn?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
