import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingPrestataireDto } from './create-booking-prestataire.dto';

export class UpdateBookingPrestataireDto extends PartialType(CreateBookingPrestataireDto) {}
