import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JwtTokenService } from 'src/services/jwt-token/jwt-token.service';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtTokenService: JwtTokenService) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies['refreshToken'];

    if (!token) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    try {
      const payload = this.jwtTokenService.verify(token);
      request.user = { ...payload, refresh_token: token };
    } catch (error) {
      throw new UnauthorizedException('Token is invalid');
    }

    return true;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
