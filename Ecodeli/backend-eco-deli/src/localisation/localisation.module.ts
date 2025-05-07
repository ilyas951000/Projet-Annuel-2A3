import { Module } from '@nestjs/common';
import { LocalisationService } from './localisation.service';
import { LocalisationController } from './localisation.controller';

@Module({
  controllers: [LocalisationController],
  providers: [LocalisationService],
})
export class LocalisationModule {}
