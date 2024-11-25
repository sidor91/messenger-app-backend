import { ApiProperty } from '@nestjs/swagger';
import { ChatDto } from './chat.dto';
import { NotificationDto } from 'src/services/notification/dto/notification.dto';
import { MessageDto } from 'src/services/message/dto/message.dto';
import { UserDto } from 'src/services/user/dto/user.dto';

class GetUserChatsDto extends ChatDto {
  @ApiProperty({
    type: NotificationDto,
    isArray: true,
  })
  notifications: NotificationDto[];

  @ApiProperty({
    type: MessageDto,
    isArray: true,
  })
  messages: MessageDto[];

  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  users: UserDto[];
}

export class GetUserChatsResponseDto {
  @ApiProperty({
    type: GetUserChatsDto,
  })
  chats: GetUserChatsDto;

  @ApiProperty({
    type: Number,
  })
  chatsCount: number;
}