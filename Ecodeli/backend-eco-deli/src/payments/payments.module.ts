// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer])],
  exports: [TypeOrmModule], // pour que d'autres modules puissent injecter TransferRepository
})
export class PaymentsModule {}
