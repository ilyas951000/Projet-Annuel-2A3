import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyDetailService } from './company-detail.service';
import { CreateCompanyDetailDto } from './dto/create-company-detail.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';

@Controller('company-detail')
export class CompanyDetailController {
  constructor(private readonly companyDetailService: CompanyDetailService) {}

  @Post()
  create(@Body() createCompanyDetailDto: CreateCompanyDetailDto) {
    return this.companyDetailService.create(createCompanyDetailDto);
  }

  @Get()
  findAll() {
    return this.companyDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyDetailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDetailDto: UpdateCompanyDetailDto) {
    return this.companyDetailService.update(+id, updateCompanyDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyDetailService.remove(+id);
  }
}
