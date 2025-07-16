import {
  Controller,
  Logger,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  Query,
  Patch,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { AuthGuard } from '@nestjs/passport'; // pour sécuriser avec JWT
import { Request } from 'express'; // pour typer `req` correctement
import { User } from 'src/users/entities/user.entity'; // assure-toi de cet import


@Controller('payments/provider')
export class TransferController {
  private readonly logger = new Logger(TransferController.name);

  constructor(private readonly transferService: TransferService) {}

  // ✅ Get balance du provider (livreur)
  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.transferService.getBalance(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refund')
  async refundClient(
    @Body() body: { providerId: number; amount: number },
    @Req() req: Request,
  ) {
    const adminId = (req.user as any).userId // ou mieux : typé avec une interface
    return this.transferService.refundClient(
      adminId,          // ✅ tiré du token, fiable
      body.providerId,  // livreur cible
      body.amount,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/total-transfers')
  getTotalTransfersAmount() {
    return this.transferService.getTotalTransfersAmount();
  }


  @Get('admin/total-revenue')
  getTotalRevenue() {
    return this.transferService.getTotalRevenue();
  }
  @Get('admin/monthly-revenue')
getMonthlyRevenue(
  @Query('month') month: number,
  @Query('year') year: number,
) {
  return this.transferService.getMonthlyRevenue(month, year);
}


  @Get('admin/monthly-transfers')
  getMonthlyTransfers(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.transferService.getMonthlyTransfersAmount(month, year);
  }

  




  // ✅ Le livreur demande un virement vers son compte
  @Post(':id/transfer')
  requestTransfer(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.transferService.requestTransfer(+id, amount);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Patch(':transferId/status')
  async updateTransferStatus(
    @Param('transferId') transferId: string,
  ) {
    return this.transferService.updateStatusToPendingValidation(+transferId);
  }


  @UseGuards(AuthGuard('jwt'))
  @Patch(':transferId/complete')
  async completeTransfer(@Param('transferId') transferId: string) {
    return this.transferService.markTransferAsCompleted(+transferId);
  }



}
