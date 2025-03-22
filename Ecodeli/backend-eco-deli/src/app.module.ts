import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SchedulesModule } from './schedules/schedules.module';
import { RatesModule } from './rates/rates.module';
import { DocumentsModule } from './documents/documents.module';
import { MovementsModule } from './movements/movements.module';
import { ContractsModule } from './contracts/contracts.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AdvertisementsModule } from './advertisements/advertisements.module';
import { PackagesModule } from './packages/packages.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';  // <-- AJOUTE ICI
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
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
      secret: '5115231248', // Remplace par une vraie clé secrète
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    SubscriptionsModule,
    SchedulesModule,
    RatesModule,
    DocumentsModule,
    MovementsModule,
    ContractsModule,
    InvoicesModule,
    AdvertisementsModule,
    PackagesModule,
    ProductsModule,
    AuthModule,  // <-- AJOUTE ICI
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
