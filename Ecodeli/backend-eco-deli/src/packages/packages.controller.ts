import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { v4 as uuidv4 } from 'uuid';

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

  @Get('available')
  findAvailablePackages() {
    return this.packagesService.findAvailablePackages();
  }

  @Post(':id/take')
  takePackage(@Param('id') id: string, @Body('userId') userId: number) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');
    return this.packagesService.takePackage(packageId, userId);
  }

  @Get('mydeliveries')
  findDeliveriesByUser(@Query('userId') userId: string) {
    return this.packagesService.findDeliveriesByUser(+userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');
    return this.packagesService.updateStatus(packageId, status);
  }

  @Patch(':id/paid')
  markAsPaid(@Param('id') id: string) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');
    return this.packagesService.markAsPaid(packageId);
  }

  @Get('history')
  findDeliveredPackagesByUser(@Query('userId') userId: string) {
    return this.packagesService.findDeliveredPackagesByUser(+userId);
  }

  @Get('client/:clientId')
  findUnpaidByClient(@Param('clientId') clientId: string) {
    return this.packagesService.findUnpaidPackagesByClient(+clientId);
  }

  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');
    return this.packagesService.update(packageId, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');
    return this.packagesService.remove(packageId);
  }

  @Get('advertisement/:adId')
  findByAdvertisement(@Param('adId') adId: string) {
    return this.packagesService.findByAdvertisementId(+adId);
  }

  @Post(':id/transfer')
  async transferPackage(@Param('id') id: string, @Body() body: any) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');

    const { fromCourierId, toCourierId, address, postalCode, city } = body;

    if (!fromCourierId || !toCourierId || !address || !postalCode || !city) {
      throw new BadRequestException('Champs manquants pour le transfert');
    }

    const transferCode = uuidv4().split('-')[0];

    await this.packagesService.createTransfer({
      packageId,
      fromCourierId,
      toCourierId,
      address,
      postalCode,
      city,
      transferCode,
    });

    return {
      message: 'Transfert enregistré',
      transferCode,
    };
  }

  @Get('/pending-transfers')
  getPendingTransfers(@Query('userId') userId: string | number) {
    const parsedId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    console.log('🛂 Requête reçue pour userId =', parsedId);

    if (isNaN(parsedId)) {
      throw new BadRequestException('ID du livreur invalide');
    }

    return this.packagesService.getPendingTransfersForUser(parsedId);
  }



  @Post(':id/confirm-transfer')
  async confirmTransfer(
    @Param('id') id: string,
    @Body() body: { toCourierId: number; code: string }
  ) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) {
      throw new BadRequestException("L'ID du colis est invalide");
    }
    return this.packagesService.confirmTransfer(packageId, body.toCourierId, body.code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const packageId = parseInt(id, 10);
    if (isNaN(packageId)) throw new BadRequestException('ID du colis invalide');
    return this.packagesService.findOne(packageId);
  }

}
