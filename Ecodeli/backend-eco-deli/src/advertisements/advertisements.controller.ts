// advertisements.controller.ts
import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))  // « photo » doit matcher ton input name
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAdvertisementDto: CreateAdvertisementDto,
  ) {
    if (file) {
      createAdvertisementDto.advertisementPhoto = file.filename;
    }
    return this.advertisementsService.create(createAdvertisementDto);
  }
}
