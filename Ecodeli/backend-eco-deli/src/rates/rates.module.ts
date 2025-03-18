import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rate } from './entities/rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rate])],
  controllers: [RatesController],
  providers: [RatesService],
})
export class RatesModule {}
