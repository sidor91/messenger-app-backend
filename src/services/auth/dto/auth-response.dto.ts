import { ApiProperty } from '@nestjs/swagger';

import { SuccessDto } from 'src/common/dto/success.dto';
import { UserWithoutPassword } from 'src/services/user/entity/user.entity';

export class AuthResponseDto extends SuccessDto {
  @ApiProperty({
    type: UserWithoutPassword,
    description: 'User data',
  })
  data: UserWithoutPassword;
}
