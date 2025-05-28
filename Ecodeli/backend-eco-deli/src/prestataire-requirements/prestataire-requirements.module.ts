import { Module } from '@nestjs/common';
import { PrestataireRequirementsService } from './prestataire-requirements.service';
import { PrestataireRequirementsController } from './prestataire-requirements.controller';

@Module({
  controllers: [PrestataireRequirementsController],
  providers: [PrestataireRequirementsService],
})
export class PrestataireRequirementsModule {}
