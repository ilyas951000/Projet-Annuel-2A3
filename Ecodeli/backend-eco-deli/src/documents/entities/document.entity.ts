import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('document')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  documentType: string;

  @Column()
  documentDate: Date;

  @Column()
  format: string;

  @Column()
  expirationDate: Date;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;
  
  @Column({ nullable: true })
  userId: number;

  // L'attribut "file" a été supprimé car il n'est plus nécessaire.
}
