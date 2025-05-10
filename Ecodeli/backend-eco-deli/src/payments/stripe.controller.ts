import { Controller, Post, Body, Req, UseGuards, Param, Get } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payments')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // ✅ Route principale d'enregistrement du compte Stripe Express (avec RIB via Stripe UI)
  @UseGuards(AuthGuard)
  @Post('create-express-account')
  createExpressAccount(@Req() req) {
    return this.stripeService.createStripeExpressAccount(req.user.userId);
  }

  @Post('intent')
  createIntent(@Body() body: { clientId: number; providerId: number; amount: number }) {
    return this.stripeService.createPaymentIntent(body.clientId, body.providerId, body.amount);
  }

  @Get('provider/:id/balance')
  getProviderBalance(@Param('id') id: number) {
    return this.stripeService.getBalanceForProvider(+id);
  }

  @Get('client/:id/history')
  getClientTransferHistory(@Param('id') id: number) {
    return this.stripeService.getTransfersByClient(+id);
  }

  @Get('provider/:id/pending-balance')
  getPendingBalance(@Param('id') id: number) {
    return this.stripeService.getPendingBalance(+id);
  }

  @Post('validate/:transferId')
  validateTransfer(@Param('transferId') transferId: number) {
    return this.stripeService.validateClientTransfer(transferId);
  }

  @Post('provider/:id/transfer')
  async transferFunds(
    @Param('id') providerId: number,
    @Body('amount') amount: number
  ) {
    return this.stripeService.transferFunds(providerId, amount);
  }

  @Post('webhook')
  handleWebhook(@Req() req) {
    return this.stripeService.handleWebhook(req.body);
  }
}
