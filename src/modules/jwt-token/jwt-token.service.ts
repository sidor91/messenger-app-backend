import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) { }
  
  verify(token: string) {
    const secret = process.env.JWT_SECRET;
    return this.jwtService.verify(token, {
      secret,
    });
  }

  async generateAccessToken(payload: {
    id: string;
    password_hash: string;
  }): Promise<string> {
    return this.jwtService.sign(payload, { expiresIn: 300 });
  }

  async generateRefreshToken(payload: {
    email: string;
    password_hash: string;
  }): Promise<string> {
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  async generateTokens(dto: {
    id: string;
    email: string;
    password_hash: string;
  }) {
    const { id, email, password_hash } = dto;

    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken({ id, password_hash }),
      this.generateRefreshToken({ email, password_hash }),
    ]);

    return { access_token, refresh_token };
  }
}
