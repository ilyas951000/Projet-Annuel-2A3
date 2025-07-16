import { Test, TestingModule } from '@nestjs/testing';
import { BookingPrestataireController } from './booking-prestataire.controller';
import { BookingPrestataireService } from './booking-prestataire.service';

describe('BookingPrestataireController', () => {
  let controller: BookingPrestataireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingPrestataireController],
      providers: [BookingPrestataireService],
    }).compile();

    controller = module.get<BookingPrestataireController>(BookingPrestataireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
