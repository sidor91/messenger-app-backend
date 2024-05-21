import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { UpdateUserDto, UpdateUserRequestDto } from './dto/update-user.dto';
import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';
import { UpdateUserResponseDto } from './dto/update-user.dto';

@ApiTags('User API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/current')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({
    type: UpdateUserResponseDto,
  })
  current(@GetCurrentUserId() userId: string) {
    return this.userService.current(userId);
  }

  @Post('/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    type: UpdateUserResponseDto,
  })
  async register(
    @Body() userDto: UpdateUserRequestDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.userService.update(userId, userDto);
  }
}
