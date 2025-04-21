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

  /** active une ville (origine ou destination) */
  async create(dto: CreateMovementDto): Promise<Movement> {
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException(`User #${dto.userId} not found`);

    // Si on crée une nouvelle origine, on désactive l'ancienne
    if (dto.isOrigin) {
      const old = await this.repo.findOne({
        where: { userId: dto.userId, isOrigin: true, active: true },
      });
      if (old) await this.repo.update(old.id, { active: false });
    }

    const m = this.repo.create({
      userId: dto.userId,
      city: dto.city,
      isOrigin: dto.isOrigin ?? false,
      active: dto.active ?? true,
      note: dto.note,
      availableOn: dto.availableOn ? new Date(dto.availableOn) : undefined,
    });
    return this.repo.save(m);
  }

  /** récupère tous les mouvements actifs d’un utilisateur */
  async findByUser(userId: number): Promise<Movement[]> {
    return this.repo.find({
      where: { userId, active: true },
      order: { isOrigin: 'DESC', createdAt: 'DESC' },
    });
  }

  /** désactive un mouvement (toggle off) */
  async deactivate(id: number): Promise<void> {
    await this.repo.update(id, { active: false });
  }
}
