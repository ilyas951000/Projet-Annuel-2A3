import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { Package } from 'src/packages/entities/package.entity';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}

  async create(dto: CreateAdvertisementDto): Promise<Advertisement> {
    const { packages: dtoPackages, ...adProps } = dto;

    const ad = this.advertisementRepository.create(adProps);

    if (Array.isArray(dtoPackages)) {
      ad.packages = dtoPackages.map(pkgDto => {
        const pkg = new Package();
        pkg.packageName        = pkgDto.item;
        pkg.packageWeight      = pkgDto.weight  ?? 0;
        pkg.packageDimension   = pkgDto.dimension ?? '';
        pkg.packageDescription = '';
        pkg.senderAddress      = '';
        pkg.recipientAddress   = '';
        pkg.packageRequirements= '';
        return pkg;
      });
    }

    return this.advertisementRepository.save(ad);
  }
  

  async findAll() {
    return await this.advertisementRepository.find();
  }

  async findOne(id: number) {
    const advertisement = await this.advertisementRepository.findOne({ where: { id } });
    if (!advertisement) {
      throw new NotFoundException('Annonce non trouvée');
    }
    return advertisement;
  }

  async update(id: number, updateAdvertisementDto: UpdateAdvertisementDto) {
  const advertisement = await this.findOne(id);
  Object.assign(advertisement, updateAdvertisementDto);
  return await this.advertisementRepository.save(advertisement);
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

  async findByUser(usersId: number): Promise<Advertisement[]> {
    return this.advertisementRepository.find({
      where: { usersId },
      order: { publicationDate: 'DESC' },
    });
  }
  async findOthers(userId: number): Promise<Advertisement[]> {
    return this.advertisementRepository.find({
      where: { usersId: Not(userId) },
      order: { publicationDate: 'DESC' },
    });
  }
  async findValidated() {
    return await this.advertisementRepository.find({
      where: { isValidated: true },
    });
  }

  
}