import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get('/nearby')
  getNearbyPackages(@Query('userId') userId: string) {
    return this.packagesService.getNearbyPackages(+userId);
  }

  @Get('/on-route')
  getOnRoutePackages(@Query('userId') userId: string) {
    return this.packagesService.getOnRoutePackages(+userId);
  }

  /**
   * Endpoint pour récupérer les colis disponibles (pas encore pris)
   */
  @Get('available')
  findAvailablePackages() {
    return this.packagesService.findAvailablePackages();
  }

  /**
   * Endpoint pour prendre un colis.
   * Ex : POST /packages/5/take
   * Body attendu : { userId: 1 }
   */
  @Post(':id/take')
  takePackage(@Param('id') id: string, @Body('userId') userId: number) {
    return this.packagesService.takePackage(+id, userId);
  }

  /**
   * Endpoint pour récupérer les livraisons en cours pour un livreur donné.
   * Ex : GET /packages/mydeliveries?userId=1
   */
  @Get('mydeliveries')
  findDeliveriesByUser(@Query('userId') userId: string) {
    return this.packagesService.findDeliveriesByUser(+userId);
  }

  /**
   * Endpoint pour mettre à jour le statut d'un colis.
   * Ex : PATCH /packages/5/status
   * Body attendu : { status: "en transit" }
   */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.packagesService.updateStatus(+id, status);
  }

  @Patch(':id/paid')
  markAsPaid(@Param('id') id: string) {
    return this.packagesService.markAsPaid(+id);
  }

  /**
   * Endpoint pour consulter l’historique des livraisons (statut "livré")
   * pour un livreur donné.
   * Ex : GET /packages/history?userId=1
   */
  @Get('history')
  findDeliveredPackagesByUser(@Query('userId') userId: string) {
    return this.packagesService.findDeliveredPackagesByUser(+userId);
  }

  /**
   * Endpoint pour récupérer les colis d’un client (non encore payés)
   * Ex : GET /packages/client/37
   */
  @Get('client/:clientId')
  findUnpaidByClient(@Param('clientId') clientId: string) {
    return this.packagesService.findUnpaidPackagesByClient(+clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }

  @Get('advertisement/:adId')
  findByAdvertisement(@Param('adId') adId: string) {
    return this.packagesService.findByAdvertisementId(+adId);
  }
}
