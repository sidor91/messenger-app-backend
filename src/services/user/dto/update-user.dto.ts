import { ApiProperty, OmitType } from '@nestjs/swagger';

import { SuccessDto } from 'src/common/dto/success.dto';

import {
  PartialUserDto,
  UserWithoutConfidentialDataDto,
} from '../entity/user.entity';

export class UpdateUserDto extends OmitType(PartialUserDto, [
  'id',
  'created_at',
  'updated_at',
] as const) {}

export class UpdateUserRequestDto extends OmitType(UpdateUserDto, [
  'access_token',
  'refresh_token',
  'password_hash',
] as const) {}

export class UpdateUserResponseDto extends SuccessDto {
  @ApiProperty({
    type: UserWithoutConfidentialDataDto,
    description: 'Updated user data',
  })
  data: UserWithoutConfidentialDataDto;
}
