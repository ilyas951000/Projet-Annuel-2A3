import { Test, TestingModule } from '@nestjs/testing';
import { BookingPrestataireService } from './booking-prestataire.service';

describe('BookingPrestataireService', () => {
  let service: BookingPrestataireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingPrestataireService],
    }).compile();

    service = module.get<BookingPrestataireService>(BookingPrestataireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
