import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get()
  findAll() {
    return this.favoritesService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.favoritesService.findByUserId(Number(userId));
  }

  @Delete()
  remove(@Query('userId') userId: string, @Query('packageId') packageId: string) {
    return this.favoritesService.removeByUserAndPackage(Number(userId), Number(packageId));
  }
}
