import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private readonly saltRounds: number;
  constructor() {
    this.saltRounds = Number(process.env.SALT_ROUNDS);
  }
  async hashPassword(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
