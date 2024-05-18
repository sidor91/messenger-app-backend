import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';

import { UserRegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export type ValidateUser = { [login: string]: string, password_hash: string }

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

  async generateAccessToken(payload: {
    id: string;
    password_hash: string;
  }): Promise<string> {
    return this.jwtService.sign(payload, { expiresIn: 30 });
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
    const access_token = await this.generateAccessToken({ id, password_hash });
    const refresh_token = await this.generateRefreshToken({
      email,
      password_hash,
    });

    return { access_token, refresh_token };
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

    const tokens = await this.generateTokens({
      id: newUser.id,
      email,
      password_hash,
    });

    const { password_hash: saved_password, ...userData } =
      await this.userService.create({
        ...newUser,
        ...tokens,
      });

    return {
      success: true,
      data: userData,
    };
  }

  async login(dto: LoginDto) {
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

    if (!isPasswordValid) {
      throw new HttpException('Password is wrong', HttpStatus.BAD_REQUEST);
    }

    const { id, email, password_hash } = user;

    const newTokens = await this.generateTokens({
      id,
      email,
      password_hash,
    });

    const { password_hash: saved_password, ...userData } =
      await this.userService.create({
        ...user,
        ...newTokens,
      });

    return {
      success: true,
      data: userData,
    };
  }

  async validateUser(payload: ValidateUser) {
    const { id, email, password_hash } = payload;
    const validationPayload: any = { password_hash };
    if (id) validationPayload.id = id;
    if (email) validationPayload.email = email;
    
    const user = await this.userService.findOne(validationPayload);
    if (user && user.password_hash === password_hash) {
      return user;
    }
    return false;
  }

  async refreshTokens(payload?: ValidateUser) {
    const { email, password_hash } = payload;

    const user = await this.userService.findOne({ email, password_hash });
  
    if (!user)
      throw new UnauthorizedException({
        message: 'Refresh token is not valid!',
      });

    const newTokens = await this.generateTokens({
      id: user.id,
      email,
      password_hash,
    });

      await this.userService.create({
        ...user,
        ...newTokens,
      });

    return {
      success: true,
      data: newTokens,
    };
  }

  current() {
    return { success: true };
  }
}
