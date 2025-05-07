import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import { Advertisement } from './entities/advertisement.entity';
import { MulterModule } from '@nestjs/platform-express';
import { Package } from 'src/packages/entities/package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Advertisement,Package]),
    MulterModule.register({ dest: './uploads' }), 
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
})
export class AdvertisementsModule {}