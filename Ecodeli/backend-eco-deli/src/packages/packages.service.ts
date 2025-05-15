import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Package } from './entities/package.entity';
import { User } from 'src/users/entities/user.entity';
import { Movement } from 'src/movements/entities/movement.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const pkg = this.packageRepository.create(createPackageDto);
    return this.packageRepository.save(pkg);
  }

  async findUnpaidPackagesByClient(clientId: number): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('package')
      .leftJoin('package.advertisement', 'ad')
      .where('ad.usersId = :clientId', { clientId })
      .andWhere('package.isPaid = false OR package.isPaid = 0')
      .getMany();
  }

  async getNearbyPackages(userId: number) {
  const origin = await this.movementRepository.findOne({
    where: { userId, active: true },
    order: { createdAt: 'DESC' },
  });

  if (!origin) throw new NotFoundException("Aucune ville d'origine trouvée");

  return this.packageRepository
    .createQueryBuilder('package')
    .leftJoinAndSelect('package.localisations', 'loc')
    .where('loc.currentCity = :city', { city: origin.originCity })
    .getMany();
}



  async getOnRoutePackages(userId: number) {
    const movements = await this.movementRepository.find({
      where: { userId, active: true },
    });

    const cities = [
      ...movements.map((m) => m.originCity),
      ...movements.map((m) => m.destinationCity),
    ];

    if (cities.length === 0) return [];

    return this.packageRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.localisations', 'loc')
      .where('loc.currentCity IN (:...cities) OR loc.destinationCity IN (:...cities)', { cities })
      .getMany();
  }


  async markAsPaid(id: number) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException('Colis non trouvé');
    }

    pkg.isPaid = true;
    await this.packageRepository.save(pkg);

    return { message: 'Colis marqué comme payé.' };
  }

  findAll() {
    return this.packageRepository.find();
  }

  findOne(id: number) {
    return this.packageRepository.findOne({ where: { id } });
  }

  update(id: number, updatePackageDto: UpdatePackageDto) {
    return this.packageRepository.update(id, updatePackageDto);
  }

  remove(id: number) {
    return this.packageRepository.delete(id);
  }

  async findAvailablePackages(): Promise<any[]> {
    const packages = await this.packageRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.advertisement', 'ad')
      .leftJoin('package.users', 'u')
      .where('u.id IS NULL')
      .getMany();

    return packages.map((pkg) => ({
      ...pkg,
      clientId: pkg.advertisement?.usersId || null,
    }));
  }

  async takePackage(packageId: number, userId: number) {
    const pkg = await this.packageRepository.findOne({
      where: { id: packageId },
      relations: ['users'],
    });

    if (!pkg) {
      throw new NotFoundException('Colis non trouvé');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!pkg.users) pkg.users = [];
    if (!pkg.users.some((u) => u.id === user.id)) {
      pkg.users.push(user);
    }

    pkg.isPaid = false;

    await this.packageRepository.save(pkg);
    return { message: 'Colis pris en charge avec succès.' };
  }

  async findDeliveriesByUser(userId: number): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.deliveryStatus != :delivered', { delivered: 'livré' })
      .getMany();
  }

  async updateStatus(packageId: number, status: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({ where: { id: packageId } });
    if (!pkg) {
      throw new NotFoundException(`Colis d'id ${packageId} non trouvé`);
    }
    pkg.deliveryStatus = status;
    return await this.packageRepository.save(pkg);
  }

  async findDeliveredPackagesByUser(userId: number): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.deliveryStatus = :status', { status: 'livré' })
      .getMany();
  }

  async findByAdvertisementId(advertisementId: number): Promise<Package[]> {
    return this.packageRepository.find({
      where: { advertisementId },
      order: { id: 'ASC' },
    });
  }
}
