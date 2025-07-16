// src/reservation/reservation.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Box } from 'src/box/entities/box.entity';
import { User } from 'src/users/entities/user.entity';
import { Package } from 'src/packages/entities/package.entity'; // Assure-toi que le chemin est correct
import { Localisation } from 'src/localisation/entities/localisation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Box, User, Package, Localisation])
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [
    TypeOrmModule,       
    ReservationService     
  ]
})
export class ReservationModule {}
