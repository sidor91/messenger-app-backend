import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // const isPublic = this.reflector.getAllAndOverride('isPublic', [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);

    // if (isPublic) return true;

    // return super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload; // Присваиваем payload к свойству user запроса
      return true;
    } catch (error) {
      return false;
    }
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
