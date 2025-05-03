import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from './entities/document.entity';
import { User } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async uploadDocument(userId: number, documentDto: any): Promise<Document> {
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
    const filePathOnDisk = path.join(uploadFolder, safeFileName);

    try {
      fs.writeFileSync(filePathOnDisk, documentDto.file.buffer);
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
      filePath: `uploads/documents/${safeFileName}`,
    });

    try {
      return await this.documentRepository.save(document);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error.message);
      throw new BadRequestException('Erreur en base de données');
    }
  }

  async validateDocument(documentId: number, action: 'accept' | 'refuse'): Promise<User> {
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

  /**
   * Supprime tous les documents (en base et fichiers) d'un même utilisateur
   */
  async deleteDocumentsByUser(userId: number): Promise<void> {
    const docs = await this.documentRepository.find({ where: { userId } });
    for (const doc of docs) {
      const fullPath = path.join(__dirname, '..', '..', 'public', doc.filePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Erreur suppression fichier ${fullPath}:`, err);
        }
      }
    }
    await this.documentRepository.delete({ userId });
  }

  async findDocumentsByStatus(userStatus: 'livreur' | 'prestataire'): Promise<(Document & { fileUrl: string })[]> {
    const users = await this.userRepository.find({ where: { userStatus } });
    if (!users.length) {
      throw new BadRequestException(`Aucun utilisateur avec le statut ${userStatus}`);
    }

    const docs = await this.documentRepository.find({
      where: { userId: In(users.map((u) => u.id)) },
      relations: ['user'],
      order: { id: 'DESC' },
    });

    return docs.map((d) => ({ ...d, fileUrl: `http://51.15.231.248:3001/${d.filePath}` }));
  }

  async findAll(): Promise<(Document & { fileUrl: string })[]> {
    const docs = await this.documentRepository.find({ relations: ['user'], order: { id: 'DESC' } });
    return docs.map((d) => ({ ...d, fileUrl: `http://51.15.231.248:3001/${d.filePath}` }));
  }
}