import { Controller, Post, Body, UseGuards, Request, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req, 
    @UploadedFile() file: Express.Multer.File, 
    @Body() documentDto: any,
  ) {
    console.log('Début du traitement du document');
    
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }
    
    // Si votre stratégie JWT utilise "sub" pour l'ID, utilisez req.user.sub
    const userId = req.user.userId || req.user.sub;
    console.log('userId:', userId);
    console.log('documentDto:', documentDto);

    if (!file) {
      throw new BadRequestException('Fichier manquant');
    }

    try {
      // Ajout du fichier à l'objet documentDto
      const document = await this.documentsService.uploadDocument(userId, { ...documentDto, file });

      return {
        message: 'Document téléchargé avec succès',
        document,
      };
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error.message);
      throw new BadRequestException('Erreur lors du téléchargement du document');
    }
  }
}
