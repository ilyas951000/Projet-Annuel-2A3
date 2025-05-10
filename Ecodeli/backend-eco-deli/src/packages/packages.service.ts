import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const pkg = this.packageRepository.create(createPackageDto);
    return this.packageRepository.save(pkg);
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

  /**
   * Retourne la liste des colis disponibles (aucun livreur ne l'a pris)
   */
  async findAvailablePackages(): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id IS NULL')
      .getMany();
  }
  
  /**
   * Permet au livreur (userId) de "prendre" un colis (packageId).
   */
  async takePackage(packageId: number, userId: number): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id: packageId },
      relations: ['users'],
    });
  
    if (!pkg) throw new NotFoundException('Colis non trouvé');
  
    if (pkg.users && pkg.users.length > 0) {
      throw new BadRequestException('Colis déjà pris en charge');
    }
  
    const user = await this.userRepository.findOne({ where: { id: userId } });
  
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
  
    pkg.users = [user];
  
    return this.packageRepository.save(pkg);
  }
  
  /**
   * Retourne les colis (livraisons) en cours pour un livreur donné.
   */
  async findDeliveriesByUser(userId: number): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.deliveryStatus != :delivered', { delivered: 'livré' })
      .getMany();
  }
  

  /**
   * Met à jour le statut de la livraison d'un colis.
   */
  async updateStatus(packageId: number, status: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({ where: { id: packageId } });
    if (!pkg) {
      throw new NotFoundException(`Colis d'id ${packageId} non trouvé`);
    }
    pkg.deliveryStatus = status;
    return await this.packageRepository.save(pkg);
  }
  
  /**
   * Retourne les colis livrés (statut "livré") pour un livreur donné (historique).
   */
  async findDeliveredPackagesByUser(userId: number): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.deliveryStatus = :status', { status: 'livré' })
      .getMany();
  }
  /**
 * Retourne tous les colis associés à une annonce donnée.
 */
async findByAdvertisementId(advertisementId: number): Promise<Package[]> {
  return this.packageRepository.find({
    where: { advertisementId },
    order: { id: 'ASC' },
  });
}

}
