import { Controller, Post, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ValidateDocumentDto } from './dto/validate-document.dto';

@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':id/validate')
  async validateDocument(
    @Param('id') id: number,
    @Body() validateDocumentDto: ValidateDocumentDto,
  ) {
    const document = await this.documentsService.findOneById(id);
    const user = document.user;
    if (!user) {
      throw new BadRequestException('Aucun utilisateur associé à ce document.');
    }

    if (user.userStatus === 'livreur') {
      if (validateDocumentDto.occasionalCourier === undefined) {
        throw new BadRequestException('Champ occasionalCourier manquant pour un livreur.');
      }
      return await this.documentsService.updateDocumentValidation(id, { occasionalCourier: validateDocumentDto.occasionalCourier });
    } else if (user.userStatus === 'prestataire') {
      if (validateDocumentDto.valid === undefined) {
        throw new BadRequestException('Champ valid manquant pour un prestataire.');
      }
      return await this.documentsService.updateDocumentValidation(id, { valid: validateDocumentDto.valid });
    } else {
      throw new BadRequestException('Statut d’utilisateur inconnu.');
    }
  }
}
