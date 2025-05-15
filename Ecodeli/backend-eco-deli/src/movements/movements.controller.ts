import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { Movement } from './entities/movement.entity';

@Controller('movements')
export class MovementsController {
  constructor(private readonly svc: MovementsService) {}

  /**
   * Crée un nouveau mouvement
   * POST /movements
   */
  @Post()
  create(@Body() dto: CreateMovementDto): Promise<Movement> {
    return this.svc.create(dto);
  }

  /**
   * Récupère les mouvements actifs d’un utilisateur
   * GET /movements/user/:userId
   */
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<Movement[]> {
    return this.svc.findByUser(userId);
  }

  /**
   * Désactive un mouvement
   * PATCH /movements/:id/deactivate
   */
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.svc.deactivate(id);
  }
}
