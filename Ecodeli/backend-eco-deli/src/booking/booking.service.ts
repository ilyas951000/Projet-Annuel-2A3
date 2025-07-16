import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { User } from 'src/users/entities/user.entity';
import { Package } from 'src/packages/entities/package.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateBookingDto) {
    console.log('Données reçues pour la réservation:', dto);
    const { scheduleId, clientId, packageId, courierId, providerId } = dto;

    if (!courierId && !providerId) {
      throw new BadRequestException('Vous devez spécifier un livreur ou un prestataire.');
    }

    const booking = new Booking();
    booking.schedule = await this.scheduleRepo.findOneByOrFail({ id: scheduleId });
    booking.client = await this.userRepo.findOneByOrFail({ id: clientId });
    booking.package = await this.packageRepo.findOneByOrFail({ id: packageId });

    if (courierId) {
      booking.courier = await this.userRepo.findOneByOrFail({ id: courierId });
    }
    if (providerId) {
      booking.provider = await this.userRepo.findOneByOrFail({ id: providerId });
    }
    booking.role = dto.role ?? (courierId ? 'livreur' : 'prestataire');
    // après avoir assigné booking.schedule...
    const schedule = await this.scheduleRepo.findOneByOrFail({ id: scheduleId });
    schedule.scheduleStatus = 'en attente'; // 👈 Mise à jour ici
    await this.scheduleRepo.save(schedule);

    booking.schedule = schedule;


    booking.status = 'en attente';
    return this.bookingRepo.save(booking);
  }

  findAll() {
    return this.bookingRepo.find({
      relations: ['client', 'schedule', 'package', 'courier', 'provider'],
    });
  }

  findOne(id: number) {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['client', 'schedule', 'package', 'courier', 'provider'],
    });
  }

  async update(id: number, dto: UpdateBookingDto) {
    const booking = await this.bookingRepo.findOneBy({ id });
    if (!booking) throw new NotFoundException();
    Object.assign(booking, dto);
    return this.bookingRepo.save(booking);
  }

  async remove(id: number) {
    const booking = await this.bookingRepo.findOneBy({ id });
    if (!booking) throw new NotFoundException();
    return this.bookingRepo.remove(booking);
  }

  async accept(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['package', 'schedule', 'courier', 'provider'],
    });

    if (!booking) throw new NotFoundException('Réservation introuvable');

    // Affecter le livreur/prestataire
    if (booking.courier) {
      booking.package.users = [booking.courier];
    } else if (booking.provider) {
      booking.package.users = [booking.provider];
    } else {
      throw new BadRequestException('Aucun prestataire ni livreur trouvé dans la demande.');
    }

    // ✅ MAJ selon ta demande
    booking.schedule.scheduleStatus = 'accepté';
    await this.scheduleRepo.save(booking.schedule);

    booking.package.deliveryStatus = 'attente de paiement';
    await this.packageRepo.save(booking.package);
    booking.package.isPaid = false;
    await this.packageRepo.save(booking.package);

    booking.status = 'accepté';
    return this.bookingRepo.save(booking);
  }


  findByCourier(id: number) {
    return this.bookingRepo.find({
      where: { courier: { id } },
      relations: ['package', 'schedule', 'client'],
    });
  }

  findByProvider(id: number) {
    return this.bookingRepo.find({
      where: { provider: { id } },
      relations: ['package', 'schedule', 'client'],
    });
  }

  async refuse(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['schedule'],
    });

    if (!booking) throw new NotFoundException('Réservation introuvable');

    booking.status = 'refusé';
    booking.schedule.scheduleStatus = 'disponible';

    await this.scheduleRepo.save(booking.schedule);
    return this.bookingRepo.save(booking);
  }

}
