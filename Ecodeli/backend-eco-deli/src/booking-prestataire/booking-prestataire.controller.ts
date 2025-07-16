import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { BookingPrestataireService } from './booking-prestataire.service';
import { CreateBookingPrestataireDto } from './dto/create-booking-prestataire.dto';
import { UpdateBookingPrestataireDto } from './dto/update-booking-prestataire.dto';

@Controller('booking-prestataire')
export class BookingPrestataireController {
  constructor(private readonly bookingPrestataireService: BookingPrestataireService) {}

  @Post()
  create(@Body() createBookingPrestataireDto: CreateBookingPrestataireDto) {
    return this.bookingPrestataireService.create(createBookingPrestataireDto);
  }

  @Get()
  findAll() {
    return this.bookingPrestataireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingPrestataireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingPrestataireDto: UpdateBookingPrestataireDto) {
    return this.bookingPrestataireService.update(+id, updateBookingPrestataireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingPrestataireService.remove(+id);
  }

  @Patch(':id/accept')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPrestataireService.accept(id);
  }

  @Patch(':id/refuse')
  refuse(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPrestataireService.refuse(id);
  }

  @Get('/provider/:id')
  findByProvider(@Param('id', ParseIntPipe) id: number) {
    return this.bookingPrestataireService.findByProvider(id);
  }

  @Get('/schedules/status')
  getSchedulesWithStatus() {
    return this.bookingPrestataireService.findBusySchedules();
  }
  
}
