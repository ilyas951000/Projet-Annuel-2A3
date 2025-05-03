// src/public-profile/public-profile.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicProfile } from './entities/public-profile.entity';
import { PublicProfileService } from './public-profile.service';
import { PublicProfileController } from './public-profile.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublicProfile, User])],
  controllers: [PublicProfileController],
  providers: [PublicProfileService],
})
export class PublicProfileModule {}
