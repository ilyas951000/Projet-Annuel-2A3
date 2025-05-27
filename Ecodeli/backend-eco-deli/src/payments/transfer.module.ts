import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller'; // 👈 À importer

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, Transaction, User, TransferHistory]),
  ],
  controllers: [TransferController], // 👈 À ajouter ici
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}
