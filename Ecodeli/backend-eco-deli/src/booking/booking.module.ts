import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

import { Booking } from './entities/booking.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Package } from 'src/packages/entities/package.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Schedule, Package, User]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
