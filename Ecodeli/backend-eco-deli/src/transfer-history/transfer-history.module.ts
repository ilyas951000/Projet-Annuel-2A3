// src/transfer-history/transfer-history.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferHistory } from './entities/transfer-history.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { TransferHistoryService } from './transfer-history.service';
import { TransferHistoryController } from './transfer-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransferHistory, Localisation])],
  providers: [TransferHistoryService],
  controllers: [TransferHistoryController],
})
export class TransferHistoryModule {}
