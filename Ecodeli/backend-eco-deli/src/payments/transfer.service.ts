import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Transfer } from './entities/transfer.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getBalance(providerId: number): Promise<{ balance: number }> {
    const txs = await this.txRepo.find({
      where: { provider: { id: providerId }, status: 'completed' },
    });
    const transfers = await this.transferRepo.find({
      where: { provider: { id: providerId } },
    });

    const earned = txs.reduce((sum, t) => sum + t.amount, 0);
    const withdrawn = transfers
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return { balance: earned - withdrawn };
  }

  async requestTransfer(providerId: number, amount: number): Promise<Transfer> {
    if (amount <= 0) throw new BadRequestException('Montant invalide');
    const { balance } = await this.getBalance(providerId);
    if (amount > balance) throw new BadRequestException('Solde insuffisant');

    const provider = await this.userRepo.findOneBy({ id: providerId });
    if (!provider) throw new NotFoundException('Prestataire introuvable');

    const transfer = this.transferRepo.create({ provider, amount, status: 'pending' });
    return this.transferRepo.save(transfer);
  }
}
