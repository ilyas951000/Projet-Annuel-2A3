import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestataireRolesService } from './prestataire-roles.service';
import { PrestataireRolesController } from './prestataire-roles.controller';
import { PrestataireRole } from './entities/prestataire-role.entity';
import { PrestataireRequirement } from 'src/prestataire-requirements/entities/prestataire-requirement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrestataireRole, PrestataireRequirement])],
  controllers: [PrestataireRolesController],
  providers: [PrestataireRolesService],
})
export class PrestataireRolesModule {}
