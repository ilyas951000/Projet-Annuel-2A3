import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Transfer } from './entities/transfer.entity';
import { User } from 'src/users/entities/user.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,

    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(TransferHistory)
    private readonly transferHistoryRepo: Repository<TransferHistory>
  ) {}

  async getBalance(providerId: number): Promise<{ balance: number }> {
    const transfers = await this.transferRepo.find({
      where: { provider: { id: providerId } },
    });

    const earned = transfers
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawn = transfers
      .filter((t) => t.status === 'paid')
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

  async distributePayment(packageId: number, totalAmount: number, clientUserId: number) {
    const segments = await this.transferHistoryRepo.find({
      where: { packageId },
      order: { transferDate: 'ASC' },
    });

    if (segments.length === 0) {
      console.log('Aucun transfert - pas de distribution');
      return;
    }

    const client = await this.userRepo.findOneBy({ id: clientUserId });
    if (!client) throw new NotFoundException('Client introuvable');

    console.log('--- DÉBUT DISTRIBUTION ---');
    console.log('TotalAmount:', totalAmount);
    console.log('Segments:', segments);

    // Supprimer tous les transferts existants pour ce colis
    await this.transferRepo.delete({ packageId });

    const transfersToInsert: Transfer[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      // 1. fromCourier
      if (seg.fromCourierId && seg.livreur1Progress) {
        const provider = await this.userRepo.findOneBy({ id: seg.fromCourierId });
        if (provider) {
          const amount = Math.round((seg.livreur1Progress / 100) * totalAmount);

          transfersToInsert.push(
            this.transferRepo.create({
              provider,
              client,
              amount,
              status: 'completed',
              isValidatedByClient: true,
              requestedAt: new Date(),
              packageId,
            })
          );

          console.log(`→ Livreur ${seg.fromCourierId} reçoit ${amount}€ (progress: ${seg.livreur1Progress}%)`);
        }
      }

      // 2. toCourier (uniquement pour le dernier segment)
      const isLast = i === segments.length - 1;
      if (isLast && seg.toCourierId && seg.livreur2Progress) {
        const lastProvider = await this.userRepo.findOneBy({ id: seg.toCourierId });
        if (lastProvider) {
          const amount = Math.round((seg.livreur2Progress / 100) * totalAmount);

          transfersToInsert.push(
            this.transferRepo.create({
              provider: lastProvider,
              client,
              amount,
              status: 'pending',
              isValidatedByClient: false,
              requestedAt: new Date(),
              packageId,
            })
          );

          console.log(`→ Livreur final ${seg.toCourierId} reçoit ${amount}€ (progress: ${seg.livreur2Progress}%)`);
        }
      }
    }

    console.log('--- FIN DISTRIBUTION ---');
    return this.transferRepo.save(transfersToInsert);
  }
}
