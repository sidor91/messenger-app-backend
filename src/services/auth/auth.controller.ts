import { Bind, Body, Controller, Get, Post, Query, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService, ValidateUser } from './auth.service';
import { UserRegisterDto, UserAuthResponseDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entity/user.entity';
import { JwtAuthGuard } from 'src/@guards/jwt-auth.guard';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    type: UserAuthResponseDto,
  })
  // @Public()
  async register(
    @Body() userDto: UserRegisterDto,
    // @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(userDto);
  }

  @Get('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    type: UserAuthResponseDto,
  })
  async login(@Query() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('/refresh')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    type: User,
  })
  refresh(@Req() request: any) {
    return this.authService.refreshTokens(request.user);
  }

  @Get('/current')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({
    type: User,
  })
  current() {
    return this.authService.current();
  }
}
