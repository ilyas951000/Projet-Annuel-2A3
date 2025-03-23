import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.userFirstName = createUserDto.userFirstName;
    user.userLastName = createUserDto.userLastName;
    // Ajoute ici les autres champs nécessaires
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Méthode pour récupérer les utilisateurs non validés (en attente de justificatif validé)
  async getPendingUsers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { valid: false },
      relations: ['justificationDocument'], // Charge le document associé
    });
  }

  // Méthode pour valider un utilisateur
  async validateUser(id: number): Promise<User | null> {
    await this.usersRepository.update(id, { valid: true });
    return this.findOne(id);
  }

  // Méthode pour refuser un justificatif (ici on ne modifie pas "valid", mais on pourrait ajouter d'autres actions)
  async rejectUser(id: number): Promise<User | null> {
    // Par exemple, on pourrait supprimer le justificatif ou notifier l'utilisateur
    return this.findOne(id);
  }
}
