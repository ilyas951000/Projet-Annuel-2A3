import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Intervention } from './entities/intervention.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { Transfer } from '../payments/entities/transfer.entity';

@Injectable()
export class InterventionService {
  constructor(
    @InjectRepository(Intervention)
    private readonly interventionRepo: Repository<Intervention>,

    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
  ) {}

  async create(dto: CreateInterventionDto): Promise<Intervention> {
    const intervention = this.interventionRepo.create({
      ...dto,
      statut: 'en_attente',
      date: new Date(),
    });

    return this.interventionRepo.save(intervention);
  }

  async findByPrestataire(prestataireId: number): Promise<Intervention[]> {
    return this.interventionRepo.find({
      where: { prestataireId },
      order: { createdAt: 'DESC' },
      relations: ['transfer'],
    });
  }

  async findByClient(clientId: number): Promise<Intervention[]> {
    return this.interventionRepo.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
      relations: ['transfer'],
    });
  }

  async updateStatut(id: number, statut: 'accepte' | 'refuse' | 'negociation') {
    const intervention = await this.interventionRepo.findOne({
      where: { id },
      relations: ['transfer'],
    });

    if (!intervention) throw new NotFoundException('Intervention introuvable');
    intervention.statut = statut;

    if (statut === 'accepte' && !intervention.transfer) {
      // 💡 Vérification s’il existe déjà un transfert équivalent
      const existingTransfer = await this.transferRepo.findOne({
        where: {
          client: { id: intervention.clientId },
          provider: { id: intervention.prestataireId },
          amount: intervention.prix,
          status: 'pending',
        },
      });

      if (existingTransfer) {
        intervention.transfer = existingTransfer;
      } else {
        const newTransfer = this.transferRepo.create({
          client: { id: intervention.clientId },
          provider: { id: intervention.prestataireId },
          amount: intervention.prix,
          status: 'pending',
          isValidatedByClient: false,
          requestedAt: new Date(),
        });
        const savedTransfer = await this.transferRepo.save(newTransfer);
        intervention.transfer = savedTransfer;
      }
    }

    return this.interventionRepo.save(intervention);
  }

  async findOneById(id: number): Promise<Intervention> {
    const intervention = await this.interventionRepo.findOne({
      where: { id },
      relations: ['transfer'],
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable');
    }

    return intervention;
  }

  async unvalidateClientTransfer(interventionId: number): Promise<string> {
    const intervention = await this.interventionRepo.findOne({
      where: { id: interventionId },
      relations: ['transfer'],
    });

    if (!intervention || !intervention.transfer) {
      throw new NotFoundException('Intervention ou transfert introuvable');
    }

    intervention.transfer.isValidatedByClient = false;
    await this.transferRepo.save(intervention.transfer);

    return 'Champ isValidatedByClient remis à false.';
  }


  async markAsPaid(id: number): Promise<Intervention> {
    const intervention = await this.interventionRepo.findOne({
      where: { id },
      relations: ['transfer'],
    });

    if (!intervention || !intervention.transfer) {
      throw new NotFoundException('Intervention ou transfert introuvable');
    }

    intervention.transfer.status = 'completed';
    intervention.transfer.isValidatedByClient = true;

    await this.transferRepo.save(intervention.transfer);
    return this.interventionRepo.save(intervention);
  }
}
