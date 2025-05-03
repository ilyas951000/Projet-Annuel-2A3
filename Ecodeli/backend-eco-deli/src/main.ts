import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Expose le dossier public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // ✅ Expose le dossier uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors();
  await app.listen(3001);
}
bootstrap();
