import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './entities/report.entity'
import { ReportsService } from './reports.service'
import { ReportsController } from './reports.controller'
import { Advertisement } from 'src/advertisements/entities/advertisement.entity'
import { Package } from 'src/packages/entities/package.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Report, Advertisement, Package])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
