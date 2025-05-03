import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advertisement } from './entities/advertisement.entity';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}

  async create(createAdvertisementDto: CreateAdvertisementDto) {
    const advertisement = this.advertisementRepository.create(createAdvertisementDto);
    return await this.advertisementRepository.save(advertisement);
  }

  async findAll() {
    return await this.advertisementRepository.find();
  }

  async findValidated() {
    return await this.advertisementRepository.find({
      where: { isValidated: true },
    });
  }

  async findOne(id: number) {
    const advertisement = await this.advertisementRepository.findOne({ where: { id } });
    if (!advertisement) {
      throw new NotFoundException('Annonce non trouvée');
    }
    return advertisement;
  }

  async update(id: number, updateAdvertisementDto: UpdateAdvertisementDto) {
    await this.advertisementRepository.update(id, updateAdvertisementDto);
    return this.findOne(id);
  }

  async findOne(id: number) {
    const advertisement = await this.advertisementRepository.findOne({ where: { id } });
    if (!advertisement) {
      throw new NotFoundException('Annonce non trouvée');
    }
    return advertisement;
  }

  async update(id: number, updateAdvertisementDto: UpdateAdvertisementDto) {
    await this.advertisementRepository.update(id, updateAdvertisementDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const advertisement = await this.findOne(id);
    return await this.advertisementRepository.remove(advertisement);
  }

  async validate(id: number) {
    const advertisement = await this.findOne(id);
    advertisement.isValidated = true;
    return await this.advertisementRepository.save(advertisement);
  }
}
