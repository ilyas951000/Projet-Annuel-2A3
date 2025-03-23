import { User } from "src/users/entities/user.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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
    fileName: string; // Nom du fichier

    @Column()
    filePath: string; // Chemin du fichier sur le serveur

    @OneToOne(() => User, (user) => user.justificationDocument, { onDelete: "CASCADE" })
    user: User;
}
