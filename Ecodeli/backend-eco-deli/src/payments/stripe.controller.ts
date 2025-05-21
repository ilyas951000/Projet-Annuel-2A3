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

  @Post('intervention-intent')
  createIntentForIntervention(@Body('interventionId') interventionId: number) {
    return this.stripeService.createPaymentIntentForIntervention(interventionId);
  }

  @Post('intervention/:id')
  createPaymentIntentForIntervention(@Param('id') id: number) {
    return this.stripeService.createPaymentIntentForIntervention(+id);
  }



  @Post('intent')
  createIntent(
    @Body() body: { clientId: number; providerId: number; amount: number; packageId?: number }
  ) {
    return this.stripeService.createPaymentIntent(
      body.clientId,
      body.providerId,
      body.amount,
      body.packageId // 👈 ici
    );
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


  @Post('subscription-checkout')
  createSubscription(@Body() body: { userId: number; priceId: string; plan: string }) {
    return this.stripeService.createSubscriptionCheckoutSession(
      body.userId,
      body.priceId,
      body.plan // 👈 rajoute ce 3e argument
    );
  }


  @Post('webhook')
  handleUnifiedStripeWebhook(@Req() req: Request) {
    return this.stripeService.handleUnifiedWebhook({
      headers: req.headers,
      body: req.body,
    });
  }




  @Post('cancel-subscription')
  cancelSubscription(@Body() body: { email: string }) {
    return this.stripeService.cancelUserSubscription(body.email);
  }

  

}
