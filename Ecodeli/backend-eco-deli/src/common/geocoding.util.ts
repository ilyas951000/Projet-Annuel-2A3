import axios from 'axios';
import { ConfigService } from '@nestjs/config';

const apiKey = process.env.OPENCAGE_API_KEY; // auto chargé par dotenv

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&language=fr&limit=1`;

  const res = await axios.get(url);
  const results = res.data?.results;

  if (!results || results.length === 0) {
    throw new Error('Adresse non trouvée');
  }

  const { lat, lng } = results[0].geometry;
  return { lat, lng };
}
