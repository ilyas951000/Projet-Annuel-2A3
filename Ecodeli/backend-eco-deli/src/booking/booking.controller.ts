import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingDto) {
    return this.bookingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }

  @Patch(':id/accept')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.accept(id);
  }

  @Get('/courier/:id')
  findByCourier(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findByCourier(id);
  }

  @Get('/provider/:id')
  findByProvider(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findByProvider(id);
  }

  @Patch(':id/refuse')
refuse(@Param('id', ParseIntPipe) id: number) {
  return this.bookingService.refuse(id);
}
}
