import { FindOneOptions, Repository } from 'typeorm';

import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';

import { JwtTokenService } from 'src/services/jwt-token/jwt-token.service';
import { setCookies } from 'src/utils/cookies.util';

import { CryptoService } from '../crypto/crypto.service';
import { UserService } from '../user/user.service';

import { LoginDto } from './dto/login.dto';
import { UserRegisterDto } from './dto/register.dto';
import { ValidateUserDto } from './dto/validate-user.dto';
import { Auth, PartialAuthDto } from './entity/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly cryptoService: CryptoService,
  ) {}

  private async findOne(options: FindOneOptions<Auth>) {
    return await this.authRepository.findOne(options);
  }

  private async update(id: string, dto: PartialAuthDto) {
    return await this.authRepository.update(id, dto);
  }

  public async validateUser(payload: ValidateUserDto) {
    const { id, password_hash, access_token } = payload;

    const authData = await this.findOne({
      where: { password_hash, access_token, user: { id } },
      relations: { user: true },
    });

    return authData?.user || false;
  }

  public async register(dto: UserRegisterDto, response: Response) {
    const { username, email, phone, password, ...restDto } = dto;

    const authData = await this.authRepository
      .createQueryBuilder('auth')
      .innerJoinAndSelect('auth.user', 'user')
      .where('user.email = :email', { email })
      .orWhere('user.username = :username', { username })
      .orWhere('user.phone = :phone', { phone })
      .getOne();

    if (authData)
      throw new HttpException(
        'User with such email or username is already exists',
        HttpStatus.BAD_REQUEST,
      );

    const password_hash = await this.cryptoService.hashPassword(password);

    const queryRunner =
      this.authRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = this.userService.create({
        username,
        email,
        phone,
        ...restDto,
      });
      const createdUser = await queryRunner.manager.save(newUser);

      const tokens = await this.jwtTokenService.generateTokens({
        id: newUser.id,
        email,
        password_hash,
      });

      const authEntity = this.authRepository.create({
        ...tokens,
        password_hash,
        user: newUser,
      });
      await queryRunner.manager.save(authEntity);

      await queryRunner.commitTransaction();

      setCookies(tokens.refresh_token, response);

      return { ...createdUser, access_token: tokens.access_token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  public async login(dto: LoginDto, response: Response) {
    const { login, password } = dto;

    const user = await this.userService.findOne({
      where: [{ email: login }, { username: login }, { phone: login }],
    });

    if (!user)
      throw new HttpException(
        'There are no user with such email, username or phone number',
        HttpStatus.BAD_REQUEST,
      );

    const userAuth = await this.findOne({ where: { user: { id: user.id } } });

    if (!userAuth)
      throw new HttpException(
        `The user with login ${login} is exists, but not authorized in the system. Please try to register one more time`,
        HttpStatus.BAD_REQUEST,
      );

    const isPasswordValid = await this.cryptoService.validatePassword(
      password,
      userAuth.password_hash,
    );

    if (!isPasswordValid) {
      throw new HttpException('Password is wrong', HttpStatus.BAD_REQUEST);
    }

    const { id, email } = user;
    const { password_hash } = userAuth;

    const newTokens = await this.jwtTokenService.generateTokens({
      id,
      email,
      password_hash,
    });

    await this.update(userAuth.id, {
      ...newTokens,
    });

    setCookies(newTokens.refresh_token, response);

    return { ...user, access_token: newTokens.access_token };
  }

  public async refreshTokens(
    payload: { email: string; password_hash: string; refresh_token: string },
    response: Response,
  ) {
    const { email, password_hash, refresh_token } = payload;

    const authData = await this.findOne({
      where: { password_hash },
      relations: { user: true },
    });

    const { user } = authData;

    if (!user || authData.refresh_token !== refresh_token)
      throw new UnauthorizedException({
        message: 'Refresh token is not valid!',
      });

    const newTokens = await this.jwtTokenService.generateTokens({
      id: user.id,
      email,
      password_hash,
    });

    await this.update(authData.id, { ...newTokens });

    setCookies(newTokens.refresh_token, response);

    return { access_token: newTokens.access_token };
  }

  public async logout(userId: string, response: Response) {
    const authData = await this.authRepository
      .createQueryBuilder('auth')
      .innerJoin('auth.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    await this.update(authData.id, {
      access_token: '',
      refresh_token: '',
    });
    setCookies('', response);
  }
}
