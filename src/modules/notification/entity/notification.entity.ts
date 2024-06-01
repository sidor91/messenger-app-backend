import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/modules/chat/entity/chat.entity';
import { Message } from 'src/modules/message/entity/message.entity';
import { User } from 'src/modules/user/entity/user.entity';

export enum NotificationEnum {
  NEW_MESSAGE = 'new_message',
  MENTION = 'mention',
  ADDED_TO_CHAT = 'added_to_chat',
}

@Entity({ name: 'notifications' })
export class Notification extends CommonColumns {
  @Column({ type: 'varchar' })
  type: NotificationEnum;

  @ManyToOne(() => Chat, (chat) => chat.id)
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'recipient_id', referencedColumnName: 'id' })
  recipient: User;

  @ManyToOne(() => Message, (message) => message.id)
  @JoinColumn({ name: 'message_id', referencedColumnName: 'id' })
  message: Message;
}