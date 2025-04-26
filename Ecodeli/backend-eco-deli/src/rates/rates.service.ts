import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rates } from './entities/rates.entity';

@Injectable()
export class RatesService {
  constructor(
    @InjectRepository(Rates)
    private readonly ratesRepository: Repository<Rates>,
  ) {}

  async findByProvider(providerId: number): Promise<Rates[]> {
    return this.ratesRepository.find({
      where: { provider: { id: providerId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }
}
