
import { InterventionsService } from './intervention.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';  // Ajoute ici `Get`

@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  // Route pour créer une nouvelle intervention
  @Post()
  create(@Body() createInterventionDto: CreateInterventionDto) {
    return this.interventionsService.create(createInterventionDto);
  }

  // Route pour mettre à jour le statut d'une intervention
  @Patch(':id/statut')
  async updateStatut(
    @Param('id') id: number,
    @Body('statut') statut: string,
  ) {
    return this.interventionsService.updateStatut(id, statut);
  }

  // Route pour récupérer toutes les interventions
  @Get()  // Ajoute cette route pour récupérer toutes les interventions
  async findAll() {
    return this.interventionsService.findAll();
  }

  // Route pour récupérer les interventions par statut
  @Get('statut/:statut')  // Ajoute cette route pour filtrer par statut
  async findByStatut(@Param('statut') statut: string) {
    return this.interventionsService.findByStatut(statut);
  }
}
