import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { UserService } from '../user/user.service';

import { LoginDto } from './dto/login.dto';
import { UserRegisterDto } from './dto/register.dto';
import { JwtTokenService } from 'src/modules/jwt-token/jwt-token.service';
import cryptoService, { CryptoServiceI } from 'src/services/crypto.service';

@Injectable()
export class AuthService {
  cryptoService: CryptoServiceI;

  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
  ) {
    this.cryptoService = cryptoService;
  }

  setCookies(token: string, response: Response) {
    response.cookie('refreshToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  async register(dto: UserRegisterDto, response: Response) {
    const { username, email, phone, password, ...restDto } = dto;

    const isExists = await this.userService.findOne([
      { email },
      { username },
      { phone },
    ]);

    if (isExists)
      throw new HttpException(
        'User with such email or username is already exists',
        HttpStatus.BAD_REQUEST,
      );

    const password_hash = await this.cryptoService.hashPassword(password);

    const newUser = await this.userService.create({
      username,
      email,
      password_hash,
      ...restDto,
    });

    const tokens = await this.jwtTokenService.generateTokens({
      id: newUser.id,
      email,
      password_hash,
    });

    const user = await this.userService.create({
      ...newUser,
      ...tokens,
    });

    delete user.password_hash;

    this.setCookies(tokens.refresh_token, response);

    return {
      success: true,
      data: { ...user },
    };
  }

  async login(dto: LoginDto, response: Response) {
    const { login, password } = dto;

    const user = await this.userService.findOne([
      { email: login },
      { username: login },
      { phone: login },
    ]);

    if (!user)
      throw new HttpException(
        'There are no user with such email, username or phone number',
        HttpStatus.BAD_REQUEST,
      );

    const isPasswordValid = await this.cryptoService.validatePassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new HttpException('Password is wrong', HttpStatus.BAD_REQUEST);
    }

    const { id, email, password_hash } = user;

    const newTokens = await this.jwtTokenService.generateTokens({
      id,
      email,
      password_hash,
    });

    const updatedUser = await this.userService.create({
      ...user,
      ...newTokens,
    });

    delete updatedUser.password_hash;

    this.setCookies(newTokens.refresh_token, response);

    return {
      success: true,
      data: { ...updatedUser },
    };
  }

  async validateUser(payload: { id: string; password_hash: string }) {
    const user = await this.userService.findOne(payload);

    if (!user || user.password_hash !== payload.password_hash) {
      return false;
    }

    return user;
  }

  async refreshTokens(
    payload: { email: string; password_hash: string; refresh_token: string },
    response: Response,
  ) {
    const { email, password_hash, refresh_token } = payload;

    const user = await this.userService.findOne({ email, password_hash });

    if (!user || user.refresh_token !== refresh_token)
      throw new UnauthorizedException({
        message: 'Refresh token is not valid!',
      });

    const newTokens = await this.jwtTokenService.generateTokens({
      id: user.id,
      email,
      password_hash,
    });

    await this.userService.create({
      ...user,
      ...newTokens,
    });

    this.setCookies(newTokens.refresh_token, response);

    return {
      success: true,
      data: newTokens,
    };
  }

  current() {
    return { success: true };
  }
}