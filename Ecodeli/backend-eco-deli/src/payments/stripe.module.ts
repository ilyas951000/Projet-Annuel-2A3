// src/payments/stripe.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { User } from 'src/users/entities/user.entity';
import { Transfer } from './entities/transfer.entity';
import { AuthModule } from 'src/auth/auth.module'; // ✅ à ajouter

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transfer]),
    AuthModule, // ✅ indispensable pour que le guard fonctionne
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
