import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDetailDto } from './dto/create-company-detail.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';
import { CompanyDetail } from './entities/company-detail.entity';

@Injectable()
export class CompanyDetailService {
  constructor(
    @InjectRepository(CompanyDetail)
    private readonly repo: Repository<CompanyDetail>,
  ) {}

  create(createDto: CreateCompanyDetailDto) {
    return this.repo.save(createDto);
  }

  findAll(): Promise<CompanyDetail[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<CompanyDetail | null> {
  return this.repo.findOne({ where: { id } });
}


  update(id: number, updateDto: UpdateCompanyDetailDto) {
    return this.repo.update(id, updateDto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
