import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";
import { RegisterUserDto } from "../users/dto/register-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { RegisterCommercantDto } from 'src/users/dto/register-commercant.dto';
import { UsersService } from 'src/users/users.service';
import { CompanyDetailService } from 'src/company-detail/company-detail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly companyDetailService: CompanyDetailService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
  const { password, ...rest } = registerUserDto;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = this.usersRepository.create({
    ...rest,
    password: hashedPassword,
  });

  return this.usersRepository.save(user);
}


  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; userStatus: string }> {
    const user = await this.usersRepository.findOneBy({ email: loginUserDto.email });

    if (!user || !(await bcrypt.compare(loginUserDto.password, user.password))) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    const payload = {
      sub: user.id,
      occasionalCourier: user.occasionalCourier,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      valid: user.valid,
      userStatus: user.userStatus,
      userSubscription: user.userSubscription,
      prestataireRoleId: user.prestataireRoleId,
      email: user.email,
    };    
    const accessToken = this.jwtService.sign(payload);


    return { 
      accessToken, 
      userStatus: user.userStatus 
    };
  }

  async registerCommercant(dto: RegisterCommercantDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      userFirstName: dto.userFirstName,
      userLastName: dto.userLastName,
      email: dto.email,
      password: hashedPassword, 
      userAddress: dto.userAddress,
      userStatus: 'commercant',
    });

    const company = await this.companyDetailService.create({
      companyName: dto.companyName,
      legalStructure: dto.legalStructure,
      siren: dto.siren,
      dateOfIncorporation: dto.dateOfIncorporation,
      startDateOfActivity: dto.startDateOfActivity,
      registeredOfficeAddressStreet: dto.registeredOfficeAddressStreet,
      registeredOfficeAddressCity: dto.registeredOfficeAddressCity,
      registeredOfficeAddressPostalCode: dto.registeredOfficeAddressPostalCode,
      currentYear: new Date().getFullYear().toString(),
      usersId: user.id,
    });

    return { user, company };
  }


}
