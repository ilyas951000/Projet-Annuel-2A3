import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PrestataireRole } from './entities/prestataire-role.entity';
import { PrestataireRequirement } from 'src/prestataire-requirements/entities/prestataire-requirement.entity';
import { Repository } from 'typeorm';
import { CreatePrestataireRoleDto } from './dto/create-prestataire-role.dto';

@Injectable()
export class PrestataireRolesService {
  constructor(
    @InjectRepository(PrestataireRole)
    private readonly roleRepo: Repository<PrestataireRole>,

    @InjectRepository(PrestataireRequirement)
    private readonly reqRepo: Repository<PrestataireRequirement>,
  ) {}

  async create(dto: CreatePrestataireRoleDto) {
    const { name, requirements,priceMin,priceMax} = dto;

    const role = this.roleRepo.create({
      name,
      priceMin,
      priceMax,
    });
    await this.roleRepo.save(role);

    if (requirements?.length) {
      const reqEntities = requirements
        .filter((r) => r.trim() !== '')
        .map((r) =>
          this.reqRepo.create({
            name: r,
            role: role,
            
          }),
        );
      await this.reqRepo.save(reqEntities);
      role.requirements = reqEntities;
    } else {
      role.requirements = [];
    }

    return role;
  }
}
