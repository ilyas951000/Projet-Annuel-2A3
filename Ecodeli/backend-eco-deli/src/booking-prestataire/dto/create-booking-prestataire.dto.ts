export class CreateBookingPrestataireDto {
  scheduleId: number;
  clientId: number;
  providerId: number;
  role: 'prestataire';
  status: 'en attente' | 'accepté' | 'refusé';
}
