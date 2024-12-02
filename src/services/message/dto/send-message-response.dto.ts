import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from 'src/services/user/dto/user.dto';

import { MessageDto } from './message.dto';

export class SendMessageResponse extends MessageDto {
  @ApiProperty({
    type: String,
    example: '"9fd26aad-f91f-4e3e-89a8-b45306af9b47"',
  })
  message_id: string;

  @ApiProperty({
    type: String,
    example: '"9fd26aad-f91f-4e3e-89a8-b45306af9b47"',
  })
  chat_id: string;

  @ApiProperty({ type: UserDto })
  sender: UserDto;
}
