import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const { userId, packageId } = createFavoriteDto;
    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, package: { id: packageId } },
    });

    if (existing) return existing;

    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      package: { id: packageId },
    });

    return this.favoriteRepository.save(favorite);
  }

  async findAll(): Promise<Favorite[]> {
    return this.favoriteRepository.find({ relations: ['user', 'package'] });
  }

  async findByUserId(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['package'],
    });
  }

  async removeByUserAndPackage(userId: number, packageId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, package: { id: packageId } },
    });

    if (!favorite) throw new NotFoundException('Favori non trouvé');

    await this.favoriteRepository.remove(favorite);
  }

  // Optionnel : si tu veux garder findOne et update
  async findOne(id: number): Promise<Favorite | null> {
    return this.favoriteRepository.findOne({ where: { id }, relations: ['user', 'package'] });
  }
}
