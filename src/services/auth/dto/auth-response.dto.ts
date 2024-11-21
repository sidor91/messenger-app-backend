import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { SuccessDto } from 'src/common/dto/success.dto';
import { UserRegisterDto } from './register.dto';
import { CommonDto } from 'src/common/dto/common.dto';

class AccessToken {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzMTMzYjMyLTBlODAtNGE3Mi1hYjBlLWY5ZDBjYWI1NjM0NSIsImFkZHJlc3MiOiIweGUzNjMxNkZiREVFOWY5Q0M5MkM0YkRhOEQxRTY4MmY1QTk3RjkxMGUiLCJpYXQiOjE3MTI2ODI3MzMsImV4cCI6MTcxMjY4MzYzM30.3ccOn-WmMO668C2lUPWkgVvCT9Ej81ZkY1Jnctri--E',
    description: 'Access token',
  })
  access_token: string;
}

class UserWithTokenIdAndDate extends IntersectionType(
  UserRegisterDto,
  CommonDto,
  AccessToken,
) {}


export class AuthResponseDto extends SuccessDto {
  @ApiProperty({
    type: UserWithTokenIdAndDate,
    description: 'User data',
  })
  data: UserWithTokenIdAndDate;
}
