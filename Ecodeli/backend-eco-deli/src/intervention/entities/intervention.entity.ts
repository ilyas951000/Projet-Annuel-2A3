import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Transfer } from 'src/payments/entities/transfer.entity';
import { OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Intervention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestataireId: number; // juste l'ID du prestataire

  @Column({ nullable: true })
  clientId?: number; // juste l'ID du client (optionnel)

  @Column()
  type: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ default: 'en_attente' })
  statut: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prix: number;

  @Column({ type: 'text', nullable: true })
  commentaireClient?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Transfer, { eager: true, nullable: true })
  @JoinColumn()
  transfer?: Transfer;
}
