import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import { Advertisement } from './entities/advertisement.entity';
import { MulterModule } from '@nestjs/platform-express';
import { Package } from 'src/packages/entities/package.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { Report } from 'src/reports/entities/report.entity'
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationModule } from 'src/reservation/reservation.module';
import { PlatformFee } from 'src/payments/entities/platform-fee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Advertisement,
      Package,
      Localisation, 
      Report,
      Reservation,
      PlatformFee, 
    ]),
    MulterModule.register({ dest: './uploads' }),
    ReservationModule,
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
})
export class AdvertisementsModule {}