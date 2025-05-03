import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicProfile } from './entities/public-profile.entity';
import { CreatePublicProfileDto } from './dto/create-public-profile.dto';
import { UpdatePublicProfileDto } from './dto/update-public-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PublicProfileService {
  constructor(
    @InjectRepository(PublicProfile)
    private readonly publicProfileRepository: Repository<PublicProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crée un nouveau profil public pour un prestataire.
   */
  async create(userId: number, dto: CreatePublicProfileDto): Promise<PublicProfile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);

    // On crée le profil à partir des champs du DTO + la relation user
    const profile = this.publicProfileRepository.create({
      ...dto,
      user,
    });

    // save renvoie Promise<PublicProfile>
    return await this.publicProfileRepository.save(profile);
  }

  /**
   * Récupère tous les profils publics d'un utilisateur.
   */
  async findByUser(userId: number): Promise<PublicProfile[]> {
    return await this.publicProfileRepository.find({ where: { user: { id: userId } } });
  }

  /**
   * Met à jour un profil public existant.
   */
  async update(id: number, dto: UpdatePublicProfileDto): Promise<PublicProfile> {
    const existing = await this.publicProfileRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Profil public avec l'ID ${id} non trouvé`);

    await this.publicProfileRepository.update(id, dto);
    // findOneOrFail lance une exception si non trouvé
    return await this.publicProfileRepository.findOneOrFail({ where: { id } });
  }

  /**
   * Supprime un profil public (optionnel).
   */
  async remove(id: number): Promise<void> {
    const existing = await this.publicProfileRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Profil public avec l'ID ${id} non trouvé`);

    await this.publicProfileRepository.remove(existing);
  }
}
