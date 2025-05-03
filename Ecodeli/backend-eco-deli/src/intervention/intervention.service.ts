import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intervention } from './entities/intervention.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private interventionRepository: Repository<Intervention>,

    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}

  // Créer une nouvelle intervention
  async create(createInterventionDto: CreateInterventionDto) {
    const advertisement = await this.advertisementRepository.findOne({
      where: { id: createInterventionDto.advertisementId },
      relations: ['users'],
    });

    if (!advertisement) {
      throw new NotFoundException('Annonce non trouvée');
    }

    const intervention = this.interventionRepository.create({
      prestataireId: createInterventionDto.prestataireId,
      clientId: advertisement.users.id,
      type: createInterventionDto.type,
      description: createInterventionDto.description,
      prix: createInterventionDto.prix,
      statut: 'en_attente',
    });

    return this.interventionRepository.save(intervention);
  }

  // Mettre à jour le statut de l'intervention
  async updateStatut(interventionId: number, statut: string) {
    const intervention = await this.interventionRepository.findOne({
      where: { id: interventionId },
    });

    if (!intervention) {
      throw new NotFoundException('Intervention non trouvée');
    }

    intervention.statut = statut;
    return this.interventionRepository.save(intervention);
  }

  // Méthode pour récupérer toutes les interventions
  async findAll() {
    return this.interventionRepository.find();
  }

  // Récupérer les interventions par statut
  async findByStatut(statut: string) {
    return this.interventionRepository.find({ where: { statut } });
  }
}
