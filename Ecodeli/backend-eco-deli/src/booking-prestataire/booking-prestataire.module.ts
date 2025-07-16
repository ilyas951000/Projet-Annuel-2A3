import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingPrestataire } from './entities/booking-prestataire.entity';
import { BookingPrestataireService } from './booking-prestataire.service';
import { BookingPrestataireController } from './booking-prestataire.controller';
import { User } from 'src/users/entities/user.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookingPrestataire, User, Schedule])],
  controllers: [BookingPrestataireController],
  providers: [BookingPrestataireService],
})
export class BookingPrestataireModule {}
