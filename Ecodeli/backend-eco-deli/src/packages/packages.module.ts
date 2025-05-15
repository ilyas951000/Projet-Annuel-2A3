import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Package } from './entities/package.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { Movement } from 'src/movements/entities/movement.entity'; // <-- ajouter ça

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, User, Localisation, Movement]),
    UsersModule,
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
