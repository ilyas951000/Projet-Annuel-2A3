import { Injectable } from '@nestjs/common';
import { CreatePrestataireRequirementDto } from './dto/create-prestataire-requirement.dto';
import { UpdatePrestataireRequirementDto } from './dto/update-prestataire-requirement.dto';

@Injectable()
export class PrestataireRequirementsService {
  create(createPrestataireRequirementDto: CreatePrestataireRequirementDto) {
    return 'This action adds a new prestataireRequirement';
  }

  findAll() {
    return `This action returns all prestataireRequirements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prestataireRequirement`;
  }

  update(id: number, updatePrestataireRequirementDto: UpdatePrestataireRequirementDto) {
    return `This action updates a #${id} prestataireRequirement`;
  }

  remove(id: number) {
    return `This action removes a #${id} prestataireRequirement`;
  }
}
