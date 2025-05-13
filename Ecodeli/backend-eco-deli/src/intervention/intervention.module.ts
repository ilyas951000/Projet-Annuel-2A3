import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterventionService } from './intervention.service';
import { InterventionController } from './intervention.controller';
import { Intervention } from './entities/intervention.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { Transfer } from '../payments/entities/transfer.entity'; // ✅ ajoute ça

@Module({
  imports: [TypeOrmModule.forFeature([Intervention, Advertisement, Transfer])],
  controllers: [InterventionController],
  providers: [InterventionService],
})
export class InterventionModule {}
