import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/services/chat/entity/chat.entity';
import { Message } from 'src/services/message/entity/message.entity';
import { User } from 'src/services/user/entity/user.entity';

import { NotificationEnum } from '../dto/notification.dto';

@Entity({ name: 'notifications' })
export class Notification extends CommonColumns {
  @Column({
    type: 'enum',
    enum: NotificationEnum,
    default: NotificationEnum.NEW_MESSAGE,
  })
  type: NotificationEnum;

  @ManyToOne(() => Chat, (chat) => chat.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id', referencedColumnName: 'id' })
  recipient: User;

  @ManyToOne(() => Message, (message) => message.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id', referencedColumnName: 'id' })
  message?: Message;
}
