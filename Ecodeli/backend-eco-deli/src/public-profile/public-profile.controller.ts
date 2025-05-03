// src/public-profile/public-profile.controller.ts
import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { PublicProfileService } from './public-profile.service';
import { CreatePublicProfileDto } from './dto/create-public-profile.dto';
import { UpdatePublicProfileDto } from './dto/update-public-profile.dto';

@Controller('public-profile')
export class PublicProfileController {
  constructor(private readonly publicProfileService: PublicProfileService) {}

  @Post(':userId')
  create(@Param('userId') userId: number, @Body() dto: CreatePublicProfileDto) {
    return this.publicProfileService.create(userId, dto);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: number) {
    return this.publicProfileService.findByUser(userId);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdatePublicProfileDto) {
    return this.publicProfileService.update(id, dto);
  }
}
