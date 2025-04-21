import { Controller, Post, Param, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ✅ Liste des documents pour les livreurs
  @UseGuards(JwtAuthGuard)
  @Get('livreur')
  async getDocumentsLivreur() {
    try {
      return await this.documentsService.findDocumentsByStatus('livreur');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des documents des livreurs');
    }
  }

  // ✅ Liste des documents pour les prestataires
  @UseGuards(JwtAuthGuard)
  @Get('prestataire')
  async getDocumentsPrestataire() {
    try {
      return await this.documentsService.findDocumentsByStatus('prestataire');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des documents des prestataires');
    }
  }

  // ✅ Valider ou refuser un document
  @UseGuards(JwtAuthGuard)
  @Post(':id/validate')
  async validateDocument(
    @Param('id') id: string,
    @Body() body: { action: 'accept' | 'refuse' },
  ) {
    const documentId = parseInt(id, 10);
    return await this.documentsService.validateDocument(documentId, body.action);
  }
}
