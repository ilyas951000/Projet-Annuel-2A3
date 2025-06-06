import { Get, Injectable, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDetailDto } from './dto/create-company-detail.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';
import { CompanyDetail } from './entities/company-detail.entity';
import { getCurrentTargetYear } from './../utils/currentTime';



import * as dayjs from 'dayjs';
@Injectable()
export class CompanyDetailService {
  constructor(
    @InjectRepository(CompanyDetail)
    private readonly repo: Repository<CompanyDetail>,
  ) {}

  findAll(): Promise<CompanyDetail[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<CompanyDetail | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, updateDto: UpdateCompanyDetailDto) {
    const company = await this.repo.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`CompanyDetail #${id} non trouvé`);
    }

    const currentYear = getCurrentTargetYear().toString();

    if (company.currentYear !== currentYear) {
      throw new Error(`Seules les données de l'année en cours (${currentYear}) peuvent être modifiées.`);
    }

    return this.repo.update(id, updateDto);
  }

  


  async findOneByUser(userId: number): Promise<CompanyDetail> {
    const company = await this.repo.findOne({
      where: { usersId: userId },
    });
    if (!company) {
      throw new NotFoundException(`CompanyDetail pour l'utilisateur #${userId} introuvable`);
    }
    return company;
  }
  
  async findAllByUser(userId: number): Promise<CompanyDetail[]> {
    const currentYear = getCurrentTargetYear();
    const contracts = await this.repo.find({
      where: { usersId: userId },
      order: { currentYear: 'ASC' },
    });

    for (const contract of contracts) {
      if (parseInt(contract.currentYear) < currentYear && contract.status !== 'revolu') {
        contract.status = 'revolu';
        await this.repo.save(contract);
      }
    }

    return contracts;
  }


  async updateStatus(id: number, status: 'accepted' | 'rejected') {
    const detail = await this.repo.findOne({ where: { id } });
    if (!detail) throw new NotFoundException(`Contrat #${id} introuvable`);

    detail.status = status;
    await this.repo.save(detail);

    if (detail.usersId) {
      await this.updateUserContractsStatus(detail.usersId);
    }

    return detail;
  }


  async updateUserContractsStatus(userId: number): Promise<void> {
    const currentYear = getCurrentTargetYear();
    const contracts = await this.repo.find({ where: { usersId: userId } });

    for (const contract of contracts) {
      if (parseInt(contract.currentYear) < currentYear && contract.status !== 'revolu') {
        contract.status = 'revolu';
        await this.repo.save(contract);
      }
    }
  }

  async create(createDto: CreateCompanyDetailDto) {
    const saved = await this.repo.save(createDto);

    if (saved.usersId) {
      await this.updateUserContractsStatus(saved.usersId);
    }

    return saved;
  }

  async remove(id: number) {
    const detail = await this.repo.findOne({ where: { id } });
    const userId = detail?.usersId;

    await this.repo.delete(id);

    if (userId) {
      await this.updateUserContractsStatus(userId);
    }
  }

}
