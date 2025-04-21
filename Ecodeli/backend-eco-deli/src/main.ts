import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // main.ts
  app.enableCors({
    origin: 'http://localhost:3000',    // ou votre domaine Next.js
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  await app.listen(3001);
}
bootstrap();
