import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ScheduleModule } from './schedules/schedules.module';
import { RatesModule } from './rates/rates.module';
import { DocumentsModule } from './documents/documents.module';
import { MovementsModule } from './movements/movements.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AdvertisementsModule } from './advertisements/advertisements.module';
import { Advertisement } from './advertisements/entities/advertisement.entity';
import { PackagesModule } from './packages/packages.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FacturableModule } from './facturable/facturable.module';
import { InterventionModule } from './intervention/intervention.module';
import { PublicProfileModule } from './public-profile/public-profile.module';
import { StripeModule } from './payments/stripe.module';
import { PicturesModule } from './pictures/pictures.module';
import { LocalisationModule } from './localisation/localisation.module';
import { CompanyDetailModule } from './company-detail/company-detail.module';
import { ContractElementModule } from './contract-element/contract-element.module';
import { MessagesModule } from './message/messages.module';
import { ChatGateway } from './message/chat.gateway'; // ✅ ajouté ici
import { TransferHistoryModule } from './transfer-history/transfer-history.module';
import { LocalModule } from './local/local.module'; // adapte le chemin selon ta structure
import { BoxModule } from './box/box.module';
import { ReservationModule } from './reservation/reservation.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '51.15.231.248',
      port: 3306,
      username: 'eric',
      password: 'eric2024_2025',
      database: 'projet',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    JwtModule.register({
      global: true,
      secret: '5115231248',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    PublicProfileModule,
    SubscriptionsModule,
    ScheduleModule,
    RatesModule,
    DocumentsModule,
    MovementsModule,
    InvoicesModule,
    AdvertisementsModule,
    PackagesModule,
    ProductsModule,
    AuthModule,
    DashboardModule,
    Advertisement,
    FacturableModule,
    InterventionModule,
    StripeModule,
    PicturesModule,
    LocalisationModule,
    CompanyDetailModule,
    ContractElementModule,
    MessagesModule,
    TransferHistoryModule,
    LocalModule,
    BoxModule, // ✅ ajouté ici
    ReservationModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway], // ✅ ajouté ici
})
export class AppModule {}
