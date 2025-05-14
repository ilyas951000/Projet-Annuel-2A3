import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transfer } from '../payments/entities/transfer.entity';
import { Intervention } from '../intervention/entities/intervention.entity';


// ✅ Typage local étendu pour éviter l'erreur TS2339
interface UserWithStripe extends User {
  stripeAccountId?: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,
    @InjectRepository(Intervention)
    private interventionRepo: Repository<Intervention>, // ✅ ajouter ceci
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      throw new Error(
        '❌ STRIPE_SECRET_KEY is not defined. Please check your .env file and ConfigModule setup.'
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
    });
    
  }

  async createStripeExpressAccount(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId }) as UserWithStripe;
    if (!user) throw new Error('Utilisateur introuvable');

    if (user.stripeAccountId) {
      return { success: true, message: 'Compte déjà existant' };
    }

    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: user.email,
      business_type: 'individual',
      capabilities: {
        transfers: { requested: true },
      },
      individual: {
        first_name: user.userFirstName,
        last_name: user.userLastName,
        email: user.email,
      },
    });

    user.stripeAccountId = account.id;
    await this.userRepo.save(user);

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONT_URL}/dashboard/livreur/wallet`,
      return_url: `${process.env.FRONT_URL}/dashboard/livreur/wallet`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      url: accountLink.url,
    };
  }

  async createPaymentIntentForIntervention(interventionId: number) {
    // ✅ Ne pas demander la relation "client" (car elle n'existe pas dans l'entité)
    const intervention = await this.interventionRepo.findOne({
      where: { id: interventionId },
    });

    if (!intervention) {
      throw new Error('Intervention introuvable');
    }

    // ✅ Charger le client manuellement via clientId
    const client = await this.userRepo.findOneBy({ id: intervention.clientId });
    if (!client) {
      throw new Error('Client introuvable');
    }

    // ✅ Créer uniquement le PaymentIntent ici
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(intervention.prix * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        interventionId: intervention.id,
        clientId: client.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    };
  }







  async createPaymentIntent(clientId: number, providerId: number, amount: number) {
    const client = await this.userRepo.findOneBy({ id: clientId });
    const provider = await this.userRepo.findOneBy({ id: providerId });

    if (!client || !provider) {
      throw new Error('Client ou prestataire introuvable');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'eur',
      payment_method_types: ['card'],
    });

    await this.transferRepo.save({
      provider,
      client,
      amount,
      status: 'pending',
      isValidatedByClient: false,
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  async validateClientTransfer(transferId: number) {
    const transfer = await this.transferRepo.findOne({
      where: { id: transferId },
      relations: ['provider', 'client'],
    });

    if (!transfer) throw new Error('Transfert introuvable');
    if (transfer.status !== 'pending') throw new Error('Déjà transféré');
    if (transfer.isValidatedByClient) throw new Error('Déjà validé');

    transfer.isValidatedByClient = true;
    transfer.status = 'completed';

    await this.transferRepo.save(transfer);
    return { success: true, message: 'Virement validé (virtuellement).' };
  }

  async getTransfersByClient(clientId: number) {
    return this.transferRepo.find({
      where: { client: { id: clientId } },
      relations: ['provider'],
      order: { requestedAt: 'DESC' },
    });
  }

  async getBalanceForProvider(providerId: number) {
    const total = await this.transferRepo
      .createQueryBuilder('transfer')
      .select('SUM(transfer.amount)', 'sum')
      .where('transfer.providerId = :providerId', { providerId })
      .andWhere('transfer.status = :status', { status: 'completed' })
      .andWhere('transfer.isValidatedByClient = true')
      .getRawOne();

    return { balance: parseInt(total.sum || '0', 10) };
  }

  async getPendingBalance(providerId: number) {
    const total = await this.transferRepo
      .createQueryBuilder('transfer')
      .select('SUM(transfer.amount)', 'sum')
      .where('transfer.providerId = :providerId', { providerId })
      .andWhere('transfer.status = :status', { status: 'pending' })
      .andWhere('transfer.isValidatedByClient = false')
      .getRawOne();

    return { pending: parseInt(total.sum || '0', 10) };
  }

  async transferFunds(providerId: number, amount: number) {
    const provider = await this.userRepo.findOneBy({ id: providerId });
    if (!provider) throw new Error('Provider not found');

    const validTransfers = await this.transferRepo.find({
      where: { provider, status: 'completed', isValidatedByClient: true },
      order: { requestedAt: 'ASC' },
    });

    const totalAvailable = validTransfers.reduce((sum, t) => sum + t.amount, 0);
    if (amount > totalAvailable) throw new Error('Solde insuffisant.');

    let toPay = amount;
    for (const t of validTransfers) {
      if (toPay <= 0) break;
      const pay = Math.min(t.amount, toPay);
      t.status = 'paid';
      await this.transferRepo.save(t);
      toPay -= pay;
    }

    return { success: true, message: 'Virement enregistré.' };
  }

  async handleWebhook(event: any) {
    if (event.type === 'payment_intent.succeeded') {
      // Traitement webhook éventuel
    }
  }
}
