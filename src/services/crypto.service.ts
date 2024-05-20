import * as bcrypt from 'bcrypt';

export interface CryptoServiceI {
  hashPassword(password: string): Promise<string>;
  validatePassword(password: string, hash: string): Promise<boolean>;
}

class CryptoService implements CryptoServiceI {
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

export default new CryptoService();
