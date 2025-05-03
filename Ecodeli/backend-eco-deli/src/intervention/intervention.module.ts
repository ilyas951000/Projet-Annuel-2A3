import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterventionsService } from './intervention.service';
import { InterventionsController } from './intervention.controller';
import { Intervention } from './entities/intervention.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Intervention, Advertisement])],
  controllers: [InterventionsController],
  providers: [InterventionsService],
})
export class InterventionModule {}
