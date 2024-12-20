import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

interface RequestWithToken extends Request {
  access_token?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: (req) => req.access_token,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: RequestWithToken, payload: any) {
    const { id, password_hash } = payload;
    const { access_token } = request;
    return this.authService.validateUser({ id, password_hash, access_token });
  }
}
