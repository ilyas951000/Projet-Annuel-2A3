import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID invalide');
    }
  }

  async create(dto: CreateAdvertisementDto): Promise<Advertisement> {
    const { packages: pkgDtos, ...adProps } = dto;
    const ad = this.advertisementRepository.create(adProps);

    if (Array.isArray(pkgDtos)) {
      ad.packages = pkgDtos.map(pkgDto => {
        const pkg = new Package();
        pkg.packageName = pkgDto.item;
        pkg.packageQuantity = pkgDto.quantity;
        pkg.packageDimension = pkgDto.dimension ?? '';
        pkg.packageWeight = pkgDto.weight ?? 0;
        pkg.deliveryStatus = 'en attente';

        const rawLocs = Array.isArray(pkgDto.localisations) ? pkgDto.localisations : [];

        pkg.localisations = rawLocs.map(locDto => {
          const loc = new Localisation();
          loc.currentStreet = locDto.currentStreet;
          loc.currentCity = locDto.currentCity;
          loc.currentPostalCode = locDto.currentPostalCode;
          loc.destinationStreet = locDto.destinationStreet;
          loc.destinationCity = locDto.destinationCity;
          loc.destinationPostalCode = locDto.destinationPostalCode;
          loc.package = pkg;
          return loc;
        });

        pkg.advertisement = ad;
        return pkg;
      });
    }

    return this.advertisementRepository.save(ad);
  }

  async findAll(): Promise<Advertisement[]> {
    const ads = await this.advertisementRepository.find({ relations: ['packages'] });
    return this.addComputedStatus(ads);
  }

  async findOne(id: number): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.advertisementRepository.findOne({
      where: { id },
      relations: ['packages', 'packages.localisations'],
    });
    if (!ad) throw new NotFoundException('Annonce non trouvée');
    return this.addComputedStatus(ad);
  }

  async update(id: number, updateDto: UpdateAdvertisementDto): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.findOne(id);
    Object.assign(ad, updateDto);
    return this.advertisementRepository.save(ad);
  }

  async updatePrice(id: number, newPrice: number): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.advertisementRepository.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Annonce introuvable');
    ad.advertisementPrice = newPrice;
    return this.advertisementRepository.save(ad);
  }

  async remove(id: number): Promise<void> {
    this.validateId(id);
    const ad = await this.advertisementRepository.findOne({
      where: { id },
      relations: ['packages'],
    });
    if (!ad) throw new NotFoundException(`L'annonce avec l'id ${id} n'existe pas.`);
    await this.advertisementRepository.remove(ad);
  }

  async validate(id: number): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.findOne(id);
    ad.isValidated = true;
    return this.advertisementRepository.save(ad);
  }

  async findByUser(usersId: number): Promise<Advertisement[]> {
  const ads = await this.advertisementRepository.find({
    where: { usersId },
    relations: ['packages', 'packages.localisations'],
    order: { publicationDate: 'DESC' },
  });
  return this.addComputedStatus(ads);
}

  async findOthers(userId: number): Promise<Advertisement[]> {
    const ads = await this.advertisementRepository.find({
      where: { usersId: Not(userId) },
      relations: ['packages', 'packages.localisations'],
      order: { publicationDate: 'DESC' },
    });
    return this.addComputedStatus(ads);
  }

  async findValidated(): Promise<Advertisement[]> {
    const ads = await this.advertisementRepository.find({
      where: { isValidated: true },
      relations: ['packages', 'packages.localisations'],
    });
    return this.addComputedStatus(ads);
  }

  /**
   * Calcul dynamique du statut global d'une annonce
   */
  private addComputedStatus<T extends Advertisement | Advertisement[]>(input: T): T {
    const compute = (ad: Advertisement) => {
      if (!ad.packages || ad.packages.length === 0) {
        ad.advertisementStatus = 'en attente';
        return;
      }

      const statuses = ad.packages.map(p => p.deliveryStatus);

      if (statuses.every(status => status === 'livré')) {
        ad.advertisementStatus = 'livré';
      } else if (statuses.some(status => status === 'en transit')) {
        ad.advertisementStatus = 'en transit';
      } else if (statuses.every(status => status === 'pris en charge')) {
        ad.advertisementStatus = 'pris en charge';
      } else {
        ad.advertisementStatus = 'en attente';
      }
    };

    if (Array.isArray(input)) {
      input.forEach(compute);
    } else {
      compute(input);
    }

    return input;
  }
}
