import { Injectable } from '@nestjs/common';
import { CreateCompanyDetailDto } from './dto/create-company-detail.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';

@Injectable()
export class CompanyDetailService {
  create(createCompanyDetailDto: CreateCompanyDetailDto) {
    return 'This action adds a new companyDetail';
  }

  findAll() {
    return `This action returns all companyDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} companyDetail`;
  }

  update(id: number, updateCompanyDetailDto: UpdateCompanyDetailDto) {
    return `This action updates a #${id} companyDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} companyDetail`;
  }
}
