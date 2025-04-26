import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RatesService } from './rates.service';
import { Rates } from './entities/rates.entity';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('provider/:id')
  async getByProvider(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Rates[]> {
    return this.ratesService.findByProvider(id);
  }
}
