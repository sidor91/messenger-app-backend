import { Body, Controller, Get, Patch, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';
import { SuccessDto } from 'src/common/dto/success.dto';

import { GetAllUsersResponseDto } from './dto/get-all-users.dto';
import { UpdateUserDto, UpdateUserResponseDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    type: UpdateUserResponseDto,
  })
  async updateUser(
    @Body() userDto: UpdateUserDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.userService.update(userId, userDto);
  }

  @Get('/current')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiResponse({
    type: UpdateUserResponseDto,
  })
  getCurrent(@GetCurrentUserId() userId: string) {
    return this.userService.current(userId);
  }

  @Get('/delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user' })
  @ApiResponse({
    type: SuccessDto,
  })
  deleteUser(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.delete(userId, response);
  }

  @Get('/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    type: GetAllUsersResponseDto,
  })
  getAllUsers() {
    return this.userService.findAll();
  }
}
