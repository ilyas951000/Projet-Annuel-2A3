import { Injectable } from '@nestjs/common';
import { CreateLocalisationDto } from './dto/create-localisation.dto';
import { UpdateLocalisationDto } from './dto/update-localisation.dto';

@Injectable()
export class LocalisationService {
  create(createLocalisationDto: CreateLocalisationDto) {
    return 'This action adds a new localisation';
  }

  findAll() {
    return `This action returns all localisation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} localisation`;
  }

  update(id: number, updateLocalisationDto: UpdateLocalisationDto) {
    return `This action updates a #${id} localisation`;
  }

  remove(id: number) {
    return `This action removes a #${id} localisation`;
  }
}
