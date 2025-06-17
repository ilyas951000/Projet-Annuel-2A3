// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(new RawBodyMiddleware().use);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors();
  //app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(3001, '0.0.0.0');

}
bootstrap();
