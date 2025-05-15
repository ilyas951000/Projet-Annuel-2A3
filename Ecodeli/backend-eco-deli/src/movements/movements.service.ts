import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private readonly repo: Repository<Movement>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Crée un nouveau mouvement avec adresse de départ et d'arrivée
   */
  async create(dto: CreateMovementDto): Promise<Movement> {
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException(`User #${dto.userId} not found`);

    const movement = this.repo.create({
      userId: dto.userId,

      originStreet: dto.originStreet,
      originCity: dto.originCity,
      originPostalCode: dto.originPostalCode,

      destinationStreet: dto.destinationStreet,
      destinationCity: dto.destinationCity,
      destinationPostalCode: dto.destinationPostalCode,

      availableOn: dto.availableOn ? new Date(dto.availableOn) : undefined,
      note: dto.note,
      active: true,
    });

    return this.repo.save(movement);
  }

  /**
   * Récupère tous les mouvements actifs d’un utilisateur
   */
  async findByUser(userId: number): Promise<Movement[]> {
    return this.repo.find({
      where: { userId, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Désactive un mouvement (soft delete logique)
   */
  async deactivate(id: number): Promise<void> {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) throw new NotFoundException(`Movement #${id} not found`);
    await this.repo.update(id, { active: false });
  }
}
