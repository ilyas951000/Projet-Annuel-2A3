import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { Package } from 'src/packages/entities/package.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}

  // src/advertisements/advertisements.service.ts
async create(dto: CreateAdvertisementDto): Promise<Advertisement> {
  const { packages: pkgDtos, ...adProps } = dto;
  const ad = this.advertisementRepository.create(adProps);

  if (Array.isArray(pkgDtos)) {
    ad.packages = pkgDtos.map(pkgDto => {
      const pkg = new Package();
      pkg.packageName        = pkgDto.item;
      pkg.packageQuantity    = pkgDto.quantity;
      pkg.packageDimension   = pkgDto.dimension ?? '';
      pkg.packageWeight      = pkgDto.weight    ?? 0;

      // on sécurise localisations en cas d'absence
      const rawLocs = Array.isArray(pkgDto.localisations)
        ? pkgDto.localisations
        : [];

      pkg.localisations = rawLocs.map(locDto => {
        const loc = new Localisation();
        loc.currentStreet         = locDto.currentStreet;
        loc.currentCity           = locDto.currentCity;
        loc.currentPostalCode     = locDto.currentPostalCode;
        loc.destinationStreet     = locDto.destinationStreet;
        loc.destinationCity       = locDto.destinationCity;
        loc.destinationPostalCode = locDto.destinationPostalCode;
        loc.package               = pkg;
        return loc;
      });

      pkg.advertisement = ad;
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