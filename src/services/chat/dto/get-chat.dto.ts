import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ChatDto } from 'src/services/chat/dto/chat.dto';
import { MessageDto } from 'src/services/message/dto/message.dto';
import { UserDto } from 'src/services/user/dto/user.dto';

class UserPickType extends PickType(UserDto, ['username', 'avatar', 'id']) {}

class GetChatMessageDto extends MessageDto {
  @ApiProperty({
    type: UserPickType,
  })
  sender: UserPickType;
}

class GetChatDto extends ChatDto {
  @ApiProperty({
    type: UserPickType,
    isArray: true,
  })
  users: UserPickType[];
}

class ChatMessagesAndCount {
  @ApiProperty({
    type: GetChatMessageDto,
    isArray: true,
  })
  messages: GetChatMessageDto[];

  @ApiProperty({
    type: Number,
  })
  messagesCount: number;
}

export class GetChatByIdDto extends PaginationDto {
  @ApiProperty({
    type: String,
    example: '23f67604-9c99-42e1-9ad8-ab375000ec1b',
  })
  @IsNotEmpty()
  chatId: string;
}

export class GetChatByIdResponseDto {
  @ApiProperty({
    type: GetChatDto,
  })
  chat: GetChatDto;

  @ApiProperty({
    type: ChatMessagesAndCount,
  })
  messages: ChatMessagesAndCount;
}
