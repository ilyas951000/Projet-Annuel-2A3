import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { User } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { In } from 'typeorm';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async uploadDocument(userId: number, documentDto: any) {
    if (!documentDto.file) {
      throw new BadRequestException('Fichier manquant');
    }

    const documentDate = new Date(documentDto.documentDate);
    const expirationDate = new Date(documentDto.expirationDate);

    if (isNaN(documentDate.getTime()) || isNaN(expirationDate.getTime())) {
      throw new BadRequestException('Dates invalides');
    }

    const uploadFolder = path.join(__dirname, '..', '..', 'public', 'uploads', 'documents');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${documentDto.file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadFolder, safeFileName);

    try {
      fs.writeFileSync(filePath, documentDto.file.buffer);
    } catch (err) {
      console.error('Erreur d’écriture fichier:', err);
      throw new BadRequestException('Échec de l’écriture du fichier');
    }

    const document = this.documentRepository.create({
      userId,
      documentType: documentDto.documentType,
      documentDate,
      expirationDate,
      format: documentDto.format,
      fileName: documentDto.file.originalname,
      filePath: `uploads/documents/${safeFileName}`, // chemin relatif public
    });

    try {
      return await this.documentRepository.save(document);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error.message);
      throw new BadRequestException('Erreur en base de données');
    }
  }

  async validateDocument(documentId: number, action: 'accept' | 'refuse') {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document || !document.user) {
      throw new BadRequestException('Document ou utilisateur introuvable');
    }

    const user = document.user;

    if (user.userStatus === 'livreur') {
      user.occasionalCourier = action === 'accept';
    } else if (user.userStatus === 'prestataire') {
      user.valid = action === 'accept';
    } else {
      throw new BadRequestException('Statut utilisateur inconnu');
    }

    return await this.userRepository.save(user);
  }

  // ✅ Méthode pour récupérer les documents par statut d'utilisateur
  async findDocumentsByStatus(userStatus: 'livreur' | 'prestataire') {
    // On récupère les utilisateurs avec le statut souhaité
    const users = await this.userRepository.find({
      where: { userStatus },
    });

    if (!users.length) {
      throw new BadRequestException(`Aucun utilisateur avec le statut ${userStatus}`);
    }

    // On récupère les documents associés à ces utilisateurs
    const documents = await this.documentRepository.find({
      where: { userId: In(users.map((user) => user.id)) },
      relations: ['user'],
      order: { id: 'DESC' },
    });

    // Ajouter l'URL du fichier pour chaque document
    return documents.map((doc) => {
      const fileUrl = `http://51.15.231.248:3001/${doc.filePath}`;
      return { ...doc, fileUrl };
    });
  }

  async findAll() {
    const docs = await this.documentRepository.find({
      relations: ['user'],
      order: { id: 'DESC' },
    });

    // Générer un champ fileUrl pour chaque document (accessible depuis le frontend)
    return docs.map((doc) => {
      const fileUrl = `http://51.15.231.248:3001/${doc.filePath}`;
      return { ...doc, fileUrl };
    });
  }
}
