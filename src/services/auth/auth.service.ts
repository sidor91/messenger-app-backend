import {
  Inject,
  Injectable,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entity/user.entity';
import { UserRegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: UserRegisterDto) {
    const {
      username,
      email,
      password,
      phone = '',
      first_name = '',
      last_name = '',
    } = dto;

    const currentUser = await this.userService.findOne({ username, email });

    if (currentUser)
      throw new HttpException(
        'User with such email or username is already exists',
        HttpStatus.BAD_REQUEST,
      );

    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    const password_hash = await bcrypt.hash(password, Number(saltRounds));

    const access_token = await this.generateAccessToken({
      ...dto,
      password_hash,
    });
    const refresh_token = await this.generateRefreshToken({
      ...dto,
      password_hash,
    });

    const user = {
      username,
      email,
      password_hash,
      phone,
      first_name,
      last_name,
      access_token,
      refresh_token,
    };

    await this.userService.create(user);

    return {
      success: true,
      data: { access_token, refresh_token },
    };
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { username: user.username, sub: user.password_hash };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = { username: user.email, sub: user.password_hash };
    return this.jwtService.sign(payload);
  }

  async validateUser(dto: { login: string, password: string }) {
    const { login, password } = dto;

    const user = await this.userService.findOne([{ email: login }, { username: login }]);

     if (user) {
       const isPasswordValid = await bcrypt.compare(
         password,
         user.password_hash,
       );
       if (isPasswordValid) {
         return user;
       }
     }
    return null;
  }
}
