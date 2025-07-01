import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterCommercantDto } from 'src/users/dto/register-commercant.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      const user = await this.authService.register(registerUserDto);

      // Message personnalisé selon le userStatus
      let message = 'Inscription réussie.';

      switch (user.userStatus) {
        case 'client':
          message = 'Client inscrit avec succès. Vous pouvez vous connecter.';
          break;
        case 'prestataire':
          message = 'Prestataire inscrit avec succès. Connectez-vous afin de soumettre vos documents pour validation.';
          break;
        case 'commercant':
          message = 'commercant inscrit avec succès. Veuillez vous connecter.';
          break;
        case 'livreur':
          message = 'livreur inscrit avec succès. Connectez-vous afin de soumettre vos documents pour validation.';
          break;
        default:
          message = 'Utilisateur inscrit avec succès. Connectez-vous pour continuer.';
      }

      return {
        message,
        user: {
          id: user.id,
          email: user.email,
          userStatus: user.userStatus,
        },
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de l\'inscription');
    }
  }


  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const { accessToken, userStatus } = await this.authService.login(loginUserDto);
      return {
        message: 'Connexion réussie',
        accessToken,
        userStatus,
      };
    } catch (error) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return {
      userId: req.user.sub,
      userLastName: req.user.userLastName,
      userFirstName: req.user.userFirstName,
      userStatus: req.user.userStatus,
      occasionalCourier: req.user.occasionalCourier,
      valid: req.user.valid,
      userSubscription: req.user.userSubscription,
      prestataireRoleId: req.user.prestataireRoleId,
    };
  }

  @Post('register/commercant')
  async registerCommercant(@Body() dto: RegisterCommercantDto) {
    try {
      const result = await this.authService.registerCommercant(dto);
      return {
        message: 'Commerçant inscrit avec succès. Connectez-vous pour continuer.',
        user: {
          id: result.user.id,
          email: result.user.email,
          userStatus: result.user.userStatus,
        },
        companyDetail: result.company,
      };
    } catch (error) {
      throw new BadRequestException(error.message || "Erreur lors de l'inscription du commerçant.");
    }
  }


}
