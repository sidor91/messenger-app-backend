import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { JwtTokenService } from 'src/services/jwt-token/jwt-token.service';
import { setCookies } from 'src/utils/cookies.util';
import {
  objectFieldRemoval,
  userFieldsToRemove,
} from 'src/utils/object-field-removal.util';

import { CryptoService } from '../crypto/crypto.service';
import { UserService } from '../user/user.service';

import { LoginDto } from './dto/login.dto';
import { UserRegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUser(payload: {
    id: string;
    password_hash: string;
    access_token: string;
  }) {
    const { id, password_hash, access_token } = payload;
    if (!id || !password_hash || !access_token) return false;
    return await this.userService.findOne(payload);
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
      phone,
      ...restDto,
    });

    const tokens = await this.jwtTokenService.generateTokens({
      id: newUser.id,
      email,
      password_hash,
    });

    const updatedUser = await this.userService.create({
      ...newUser,
      ...tokens,
    });

    const data = objectFieldRemoval(updatedUser, userFieldsToRemove.PASSWORD);

    setCookies(tokens.refresh_token, response);

    return {
      success: true,
      data,
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

    const data = objectFieldRemoval(updatedUser, userFieldsToRemove.PASSWORD);

    setCookies(newTokens.refresh_token, response);

    return {
      success: true,
      data,
    };
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

    await this.userService.update(user.id, newTokens);

    setCookies(newTokens.refresh_token, response);

    return {
      success: true,
      data: newTokens,
    };
  }

  async logout(userId: string, response: Response) {
    await this.userService.update(userId, {
      access_token: '',
      refresh_token: '',
    });
    setCookies('', response);
    return { success: true };
  }
}
