import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingPrestataire } from './entities/booking-prestataire.entity';
import { User } from 'src/users/entities/user.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { CreateBookingPrestataireDto } from './dto/create-booking-prestataire.dto';
import { UpdateBookingPrestataireDto } from './dto/update-booking-prestataire.dto';

@Injectable()
export class BookingPrestataireService {
  constructor(
    @InjectRepository(BookingPrestataire)
    private readonly bookingRepo: Repository<BookingPrestataire>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  async create(dto: CreateBookingPrestataireDto) {
    const { scheduleId, clientId, providerId } = dto;

    const booking = new BookingPrestataire();
    booking.schedule = await this.scheduleRepo.findOneByOrFail({ id: scheduleId });
    booking.client = await this.userRepo.findOneByOrFail({ id: clientId });
    booking.provider = await this.userRepo.findOneByOrFail({ id: providerId });
    booking.status = 'en attente';
    booking.role = 'prestataire';

    // ⚠️ Mettre à jour le statut du schedule
    booking.schedule.scheduleStatus = 'en attente';
    await this.scheduleRepo.save(booking.schedule);

    return this.bookingRepo.save(booking);
  }

  findAll() {
    return `This action returns all bookingPrestataire`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingPrestataire`;
  }

  update(id: number, updateBookingPrestataireDto: UpdateBookingPrestataireDto) {
    return `This action updates a #${id} bookingPrestataire`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookingPrestataire`;
  }

  async findByProvider(providerId: number) {
    return this.bookingRepo.find({
      where: { provider: { id: providerId }, status: 'en attente' },
      relations: ['client', 'schedule', 'provider'],
    });
  }

  async accept(id: number) {
    const booking = await this.bookingRepo.findOne({ where: { id }, relations: ['schedule'] });
    if (!booking) throw new NotFoundException();

    booking.status = 'accepté';
    booking.schedule.scheduleStatus = 'accepté';
    await this.scheduleRepo.save(booking.schedule);

    return this.bookingRepo.save(booking);
  }

  async refuse(id: number) {
    const booking = await this.bookingRepo.findOne({ where: { id }, relations: ['schedule'] });
    if (!booking) throw new NotFoundException();

    booking.status = 'refusé';
    booking.schedule.scheduleStatus = 'disponible';
    await this.scheduleRepo.save(booking.schedule);

    return this.bookingRepo.save(booking);
  }

  async findBusySchedules() {
    const bookings = await this.bookingRepo.find({
      relations: ['schedule'],
      where: [
        { status: 'en attente' },
        { status: 'accepté' }
      ],
    });

    return bookings.map((b) => ({
      scheduleId: b.schedule.id,
      status: b.status,
    }));
  }


}
