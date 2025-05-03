// advertisements.controller.ts
import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req, Get, Patch, Param } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Get('validated')
  async findAllValidated() {
    return this.advertisementsService.findValidated();
  }

  @Post()
  @UseGuards(JwtAuthGuard)                      
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @Req() req                                 
  ) {
    if (file) {
      createAdvertisementDto.advertisementPhoto = file.filename;
    }

    const userId = req.user.userId || req.user.sub;

    return this.advertisementsService.create({
      ...createAdvertisementDto,
      //usersId,
    });
    return this.advertisementsService.create(createAdvertisementDto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMyAds(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    return this.advertisementsService.findByUser(userId);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdvertisementDto,
    @Req() req
  ) {
    return this.advertisementsService.update(+id, updateDto);
  }
  
  @Get('others')
  @UseGuards(JwtAuthGuard)
  async findOtherAds(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    return this.advertisementsService.findOthers(userId);
  }

}
