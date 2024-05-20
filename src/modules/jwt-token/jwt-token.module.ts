import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtTokenModule {}
