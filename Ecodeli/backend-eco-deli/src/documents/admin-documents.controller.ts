import { Controller, Post, Param, Body, Get, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ✅ Liste des documents pour l'admin
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllDocuments() {
    return this.documentsService.findAll(); // Méthode présente dans le service
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
