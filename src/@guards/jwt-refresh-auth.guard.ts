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
  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);

    const token = request.cookies['refresh_token'];

    if (!token) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    try {
      const payload = await this.jwtTokenService.verify(token);
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

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    } else if (context.getType() === 'ws') {
      return context.switchToWs().getClient();
    }
    throw new UnauthorizedException('Unsupported connection type');
  }
}
