import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';

import { UserRegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string) {
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    return await bcrypt.hash(password, Number(saltRounds));
  }

  async validatePassword(password: string, password_hash: string) {
    return await bcrypt.compare(password, password_hash);
  }

  async generateAccessToken(id: string, password: string): Promise<string> {
    const payload = { id, password };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(email: string, password: string): Promise<string> {
    const payload = { email, password };
    return this.jwtService.sign(payload);
  }

  async register(dto: UserRegisterDto) {
    const { username, email, password, ...restDto } = dto;

    const isExists = await this.userService.findOne([{ email }, { username }]);

    if (isExists)
      throw new HttpException(
        'User with such email or username is already exists',
        HttpStatus.BAD_REQUEST,
      );

    const password_hash = await this.hashPassword(password);

    const newUser = await this.userService.create({
      username,
      email,
      password_hash,
      ...restDto,
    });

    const access_token = await this.generateAccessToken(
      newUser.id,
      password_hash,
    );
    const refresh_token = await this.generateRefreshToken(email, password_hash);

    const { password_hash: saved_password, ...userData } =
      await this.userService.create({
        ...newUser,
        access_token,
        refresh_token,
      });

    return {
      success: true,
      data: userData,
    };
  }

  async validateUser(dto: { login: string; password: string }) {
    const { login, password } = dto;

    const user = await this.userService.findOne([
      { email: login },
      { username: login },
    ]);

    if (!user)
      throw new HttpException(
        'There are no user with such email, username or phone number',
        HttpStatus.BAD_REQUEST,
      );

    const isPasswordValid = await this.validatePassword(
      password,
      user.password_hash,
    );

    if (isPasswordValid) {
      return { success: true, data: user };
    } else {
      throw new HttpException('Password is wrong', HttpStatus.BAD_REQUEST);
    }
  }
}
