import { ApiProperty, PickType } from '@nestjs/swagger';
import { ChatDto } from 'src/services/chat/dto/chat.dto';
import { MessageDto } from 'src/services/message/dto/message.dto';
import { UserDto } from 'src/services/user/dto/user.dto';

class UserPickType extends PickType(UserDto, ['username', 'avatar', 'id']) {}

class GetChatMessagesWithSenderDto extends MessageDto {
  @ApiProperty({
    type: UserPickType,
  })
  sender: UserPickType;
}

class GetChatWithUsersDto extends ChatDto {
  @ApiProperty({
    type: UserPickType,
    isArray: true,
  })
  users: UserPickType[];
}

class ChatMessagesAndCount {
  @ApiProperty({
    type: GetChatMessagesWithSenderDto,
    isArray: true,
  })
  messages: GetChatMessagesWithSenderDto[];

  @ApiProperty({
    type: Number,
  })
  messagesCount: number;
}

export class GetChatByIdResponseDto {
  @ApiProperty({
    type: GetChatWithUsersDto,
  })
  chat: GetChatWithUsersDto;

  @ApiProperty({
    type: ChatMessagesAndCount,
  })
  messages: ChatMessagesAndCount;
}
