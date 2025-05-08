// advertisements.controller.ts
import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req, Get, Patch, Param, BadRequestException } from '@nestjs/common';

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
    // 1) parser packages si c'est une string
    let pkgs: any[] = [];
    if (createAdvertisementDto.packages) {
      if (typeof createAdvertisementDto.packages === 'string') {
        try {
          pkgs = JSON.parse(createAdvertisementDto.packages);
        } catch {
          throw new BadRequestException('packages doit être un JSON valide');
        }
      } else {
        pkgs = createAdvertisementDto.packages;
      }
    }

    // **Réassignation du DTO pour la création en cascade**
    createAdvertisementDto.packages = pkgs;

    // 2) validation “manuelle” sommaire
    for (const [i, p] of pkgs.entries()) {
      if (typeof p.quantity !== 'number' || p.quantity < 1) {
        throw new BadRequestException(`packages[${i}].quantity invalide`);
      }
      if (typeof p.item !== 'string' || !p.item.trim()) {
        throw new BadRequestException(`packages[${i}].item invalide`);
      }
      // … même chose pour p.dimension, p.weight, etc.

      if (!Array.isArray(p.localisations) || p.localisations.length === 0) {
        throw new BadRequestException(`packages[${i}].localisations manquantes`);
      }
      for (const [j, loc] of p.localisations.entries()) {
        if (typeof loc.currentStreet !== 'string') {
          throw new BadRequestException(
            `packages[${i}].localisations[${j}].currentStreet invalide`
          );
        }
        // … répétez pour chaque champ de localisation
      }
    }

    if (file) {
      createAdvertisementDto.advertisementPhoto = file.filename;
    }

    const userId = req.user.userId || req.user.sub;
    createAdvertisementDto.usersId = userId;

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
