import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async uploadDocument(userId: number, documentDto: any) {
    console.log('Début du traitement du document');
    console.log('userId:', userId);
    console.log('documentDto:', documentDto);

    if (!documentDto.file) {
      throw new BadRequestException('Fichier manquant');
    }

    // Conversion des dates
    const documentDate = new Date(documentDto.documentDate);
    const expirationDate = new Date(documentDto.expirationDate);
    if (isNaN(documentDate.getTime())) {
      throw new BadRequestException(`La date documentDate est invalide: ${documentDto.documentDate}`);
    }
    if (isNaN(expirationDate.getTime())) {
      throw new BadRequestException(`La date expirationDate est invalide: ${documentDto.expirationDate}`);
    }

    // Chemin vers le dossier uploads/documents
    const uploadFolder = path.join(__dirname, '..', '..', 'uploads', 'documents');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${documentDto.file.originalname}`;
    const filePath = path.join(uploadFolder, fileName);

    // Sauvegarde du fichier sur disque
    try {
      fs.writeFileSync(filePath, documentDto.file.buffer);
    } catch (err) {
      console.error('Erreur lors de l\'écriture du fichier sur le disque:', err);
      throw new BadRequestException('Erreur lors de la sauvegarde du fichier sur le disque');
    }

    // Création de l'entité Document (sans l'attribut "file")
    const document = this.documentRepository.create({
      userId,
      documentType: documentDto.documentType,
      documentDate,
      expirationDate,
      format: documentDto.format,
      fileName: documentDto.file.originalname,
      filePath,  // Chemin complet où le fichier a été enregistré sur le disque
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
}
