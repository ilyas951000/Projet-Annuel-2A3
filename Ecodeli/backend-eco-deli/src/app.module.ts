import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SchedulesModule } from './schedules/schedules.module';
import { RatesModule } from './rates/rates.module';
import { DocumentsModule } from './documents/documents.module';
import { MovementModule } from './movement/movement.module';


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
    UsersModule,
    SubscriptionsModule,
    SchedulesModule,
    RatesModule,
    DocumentsModule,
    MovementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
