import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

import { UserDto } from 'src/services/user/dto/user.dto';

import { ChatDto } from './chat.dto';

export enum AddOrDeleteUserEnum {
  ADD = 'add',
  DELETE = 'delete',
}

export class AddOrDeleteUserToChatDto {
  @ApiProperty({
    type: String,
    example: 'ed8ce60b-bb0a-40ca-a075-688287617d0a',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    type: String,
    example: '23f67604-9c99-42e1-9ad8-ab375000ec1b',
  })
  @IsNotEmpty()
  @IsUUID()
  chatId: string;
}

export class AddUserToChatResponseDto extends ChatDto {
  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  users: UserDto[];
}
