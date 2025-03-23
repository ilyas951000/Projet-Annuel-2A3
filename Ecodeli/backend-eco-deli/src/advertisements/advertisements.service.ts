import { Injectable } from '@nestjs/common';
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

  create(createAdvertisementDto: CreateAdvertisementDto) {
    const advertisement = this.advertisementRepository.create(createAdvertisementDto);
    return this.advertisementRepository.save(advertisement);
  }

  findAll() {
    return this.advertisementRepository.find();
  }

  findOne(id: number) {
    return this.advertisementRepository.findOne({ where: { id } });
  }

  update(id: number, updateAdvertisementDto: UpdateAdvertisementDto) {
    return this.advertisementRepository.update(id, updateAdvertisementDto);
  }

  remove(id: number) {
    return this.advertisementRepository.delete(id);
  }

  validate(id: number) {
    // Exemple de validation
    return this.advertisementRepository.findOne({ where: { id } })
      .then(advertisement => advertisement !== null);
  }
}
