// advertisements.controller.ts
import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  // advertisements.controller.ts
  @Post()
  @UseGuards(JwtAuthGuard)                       // PROTÉGER la route
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @Req() req                                  // récupère req.user
  ) {
    // 1) Ajoutez la photo si présente
    if (file) {
      createAdvertisementDto.advertisementPhoto = file.filename;
    }

    // 2) Extrait vraiment l’ID du token
    const userId = req.user.userId || req.user.sub;

    // 3) Passez-le au service (et retirez userId du DTO côté client)
    return this.advertisementsService.create({
      ...createAdvertisementDto,
      userId,
    });
  }

}
