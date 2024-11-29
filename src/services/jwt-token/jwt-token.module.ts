import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtTokenService } from './jwt-token.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    ConfigModule
  ],
  providers: [JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtTokenModule {}
