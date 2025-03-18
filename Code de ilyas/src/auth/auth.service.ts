import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const user = this.usersRepository.create({ ...registerUserDto, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findOneBy({ email: loginUserDto.email });
    if (user && await bcrypt.compare(loginUserDto.password, user.password)) {
      const payload = { username: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    }
    throw new Error('Invalid credentials');
  }
}
