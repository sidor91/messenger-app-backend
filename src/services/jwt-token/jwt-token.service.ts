import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
  JWT_SECRET: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.JWT_SECRET = this.configService.getOrThrow('JWT_SECRET');
  }

  public async verify(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: this.JWT_SECRET,
    });
  }

  async generateAccessToken(payload: {
    id: string;
    password_hash: string;
  }): Promise<string> {
    return await this.jwtService.signAsync(payload, { expiresIn: '10h' });
  }

  async generateRefreshToken(payload: {
    email: string;
    password_hash: string;
  }): Promise<string> {
    return await this.jwtService.signAsync(payload, { expiresIn: '1d' });
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
