import { Bind, Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { UserRegisterDto, UserAuthResponseDto } from './dto/register.dto';
import { ValidateDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

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
  async getCurrentUser(
    @Query() getCurrentUserDto: ValidateDto,
  ) {
    return this.authService.validateUser(getCurrentUserDto);
  }
}
