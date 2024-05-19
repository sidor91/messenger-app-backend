import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';
import { Public } from 'src/@decorators/public.decorator';
import { JwtRefreshAuthGuard } from 'src/@guards/jwt-refresh-auth.guard';

import { User } from '../user/entity/user.entity';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { UserRegisterDto, UserRegisterResponseDto } from './dto/register.dto';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @Public()
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    type: UserRegisterResponseDto,
  })
  async register(
    @Body() userDto: UserRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(userDto, response);
  }

  @Post('/login')
  @Public()
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    type: UserRegisterResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }

  @Get('/refresh')
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    type: RefreshTokenResponseDto,
  })
  refresh(@Req() request: any, @Res({ passthrough: true }) response: Response) {
    return this.authService.refreshTokens(request.user, response);
  }

  @Get('/current')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({
    type: User,
  })
  current(@GetCurrentUserId() userId: string) {
    return userId;
  }
}
