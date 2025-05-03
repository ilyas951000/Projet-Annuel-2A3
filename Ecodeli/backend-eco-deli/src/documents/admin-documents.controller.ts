import { Controller, Post, Param, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // Liste des documents pour les livreurs
  @UseGuards(JwtAuthGuard)
  @Get('livreur')
  async getDocumentsLivreur() {
    try {
      return await this.documentsService.findDocumentsByStatus('livreur');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des documents des livreurs');
    }
  }

  // Liste des documents pour les prestataires
  @UseGuards(JwtAuthGuard)
  @Get('prestataire')
  async getDocumentsPrestataire() {
    try {
      return await this.documentsService.findDocumentsByStatus('prestataire');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des documents des prestataires');
    }
  }

  // Valider ou refuser un document
  @UseGuards(JwtAuthGuard)
  @Post(':id/validate')
  async validateDocument(
    @Param('id') id: string,
    @Body() body: { action: 'accept' | 'refuse' },
  ) {
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      throw new BadRequestException('ID de document invalide');
    }
    return await this.documentsService.validateDocument(documentId, body.action);
  }

  // Supprimer tous les documents d'un utilisateur (refuser tout)
  @UseGuards(JwtAuthGuard)
  @Post(':userId/refuse-all')
  async refuseAllByUser(
    @Param('userId') userIdParam: string,
  ) {
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Paramètre userId invalide');
    }
    await this.documentsService.deleteDocumentsByUser(userId);
    return {
      message: `Tous les documents de l'utilisateur #${userId} ont été supprimés.`,
    };
  }

  // Accepter tous les documents d'un utilisateur (accept all)
  @UseGuards(JwtAuthGuard)
  @Post(':userId/accept-all')
  async acceptAllByUser(
    @Param('userId') userIdParam: string,
  ) {
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Paramètre userId invalide');
    }
    // Récupérer tous les documents de cet utilisateur
    const allDocs = (await this.documentsService.findAll()).filter(d => d.userId === userId);
    await Promise.all(
      allDocs.map(doc => this.documentsService.validateDocument(doc.id, 'accept'))
    );
    return {
      message: `Tous les documents de l'utilisateur #${userId} ont été acceptés.`,
    };
  }
}
