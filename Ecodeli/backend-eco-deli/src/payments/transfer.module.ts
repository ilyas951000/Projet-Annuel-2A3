import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';
import { TransferService } from './transfer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, Transaction, User, TransferHistory]),
  ],
  providers: [TransferService],
  exports: [TransferService], // 👈 Export pour l'injection dans d'autres modules
})
export class TransferModule {}
