import { Module } from '@nestjs/common';
import { CompanyDetailService } from './company-detail.service';
import { CompanyDetailController } from './company-detail.controller';

@Module({
  controllers: [CompanyDetailController],
  providers: [CompanyDetailService],
})
export class CompanyDetailModule {}
