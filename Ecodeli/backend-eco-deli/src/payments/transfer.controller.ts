import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { TransferService } from './transfer.service';

@Controller('payments/provider')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.transferService.getBalance(+id);
  }

  @Post(':id/transfer')
  requestTransfer(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.transferService.requestTransfer(+id, amount);
  }
}
