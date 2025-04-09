import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { User } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async uploadDocument(userId: number, documentDto: any) {
    console.log('Début du traitement du document');
    console.log('userId:', userId);
    console.log('documentDto:', documentDto);

    if (!documentDto.file) {
      throw new BadRequestException('Fichier manquant');
    }

    const documentDate = new Date(documentDto.documentDate);
    const expirationDate = new Date(documentDto.expirationDate);
    if (isNaN(documentDate.getTime())) {
      throw new BadRequestException(`La date documentDate est invalide: ${documentDto.documentDate}`);
    }
    if (isNaN(expirationDate.getTime())) {
      throw new BadRequestException(`La date expirationDate est invalide: ${documentDto.expirationDate}`);
    }

    const uploadFolder = path.join(__dirname, '..', '..', 'uploads', 'documents');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${documentDto.file.originalname}`;
    const filePath = path.join(uploadFolder, fileName);

    try {
      fs.writeFileSync(filePath, documentDto.file.buffer);
    } catch (err) {
      console.error('Erreur lors de l\'écriture du fichier sur le disque:', err);
      throw new BadRequestException('Erreur lors de la sauvegarde du fichier sur le disque');
    }

    const document = this.documentRepository.create({
      userId,
      documentType: documentDto.documentType,
      documentDate,
      expirationDate,
      format: documentDto.format,
      fileName: documentDto.file.originalname,
      filePath,
    });

    try {
      const savedDocument = await this.documentRepository.save(document);
      console.log('Document traité:', savedDocument);
      return savedDocument;
    } catch (error) {
      console.error('Erreur lors du traitement du document:', error.message);
      throw new BadRequestException('Erreur lors du téléchargement du document');
    }
  }

  async validateDocument(documentId: number, action: 'accept' | 'refuse') {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });
    if (!document) {
      throw new BadRequestException('Document non trouvé');
    }
    if (!document.user) {
      throw new BadRequestException('Document sans utilisateur associé');
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

  // ✅ Nouvelle méthode pour récupérer tous les documents (avec l'utilisateur lié)
  async findAll() {
    return await this.documentRepository.find({
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }
}
