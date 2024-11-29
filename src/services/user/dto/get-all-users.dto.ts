import { ApiProperty } from '@nestjs/swagger';

import { SuccessDto } from 'src/common/dto/success.dto';

import { UpdatedUserWithCommonFields } from './update-user.dto';

export class GetAllUsersResponseDto extends SuccessDto {
  @ApiProperty({
    type: UpdatedUserWithCommonFields,
    isArray: true,
    description: 'Updated user data',
  })
  data: UpdatedUserWithCommonFields[];
}
