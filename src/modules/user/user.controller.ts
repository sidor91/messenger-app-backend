import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';
import { SuccessDto } from 'src/common/dto/success.dto';

import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    type: UpdateUserResponseDto,
  })
  async updateUser(
    @Body() userDto: UpdateUserRequestDto,
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
  deleteUser(@GetCurrentUserId() userId: string) {
    return this.userService.delete(userId);
  }
}
