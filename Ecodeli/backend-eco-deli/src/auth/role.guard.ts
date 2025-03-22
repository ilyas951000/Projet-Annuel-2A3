import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>("role", context.getHandler());
    if (!requiredRole) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new UnauthorizedException("Token manquant");

    const token = authHeader.split(" ")[1];
    const decodedToken = this.jwtService.verify(token);
    
    if (decodedToken.userStatus !== requiredRole) {
      throw new UnauthorizedException("Accès refusé");
    }

    return true;
  }
}
