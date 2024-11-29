import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from 'src/common/entities/common.entity';

export enum NotificationEnum {
  NEW_MESSAGE = 'new_message',
  MENTION = 'mention',
  ADDED_TO_CHAT = 'added_to_chat',
  NEW_USER_IN_CHAT = 'new-user-in-chat',
  DELETE_USER_FROM_CHAT = 'delete-user-from-chat',
}

export class NotificationDto extends CommonColumns {
  @ApiProperty({
    type: String,
    enum: NotificationEnum,
  })
  type: NotificationEnum;
}
