import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAll();  
  }

  @Get('pending')
  findPendingUsers(): Promise<User[]> {
    return this.usersService.getPendingUsers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> { 
    return this.usersService.remove(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/validate')
  async validateUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.validateUser(id);
  }

  @Patch(':id/reject')
  async rejectUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.usersService.rejectUser(id);
  }
}

