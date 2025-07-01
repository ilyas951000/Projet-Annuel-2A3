import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrestataireRolesService } from './prestataire-roles.service';
import { CreatePrestataireRoleDto } from './dto/create-prestataire-role.dto';
import { UpdatePrestataireRoleDto } from './dto/update-prestataire-role.dto';

@Controller('prestataire-roles')
export class PrestataireRolesController {
  constructor(private readonly prestataireRolesService: PrestataireRolesService) {}

  @Post()
  create(@Body() dto: CreatePrestataireRoleDto) {
    return this.prestataireRolesService.create(dto);
  }
  @Get()
  findAll() {
    return this.prestataireRolesService.findAll();
  }

}
