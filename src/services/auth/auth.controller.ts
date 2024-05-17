import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CurrentUserDto, UserRegisterDto } from './dto/register.dto';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  // @ApiResponse({
  //   type: AuthUserResponseDto,
  // })
  // @Public()
  async register(
    @Body() userDto: UserRegisterDto,
    // @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(userDto);
  }

  @Get('/current-user')
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@Query() getCurrentUserDto: CurrentUserDto) {
    return this.authService.validateUser(getCurrentUserDto);
  }
}
