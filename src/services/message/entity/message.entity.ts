import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/services/chat/entity/chat.entity';
import { User } from 'src/services/user/entity/user.entity';

@Entity({ name: 'messages' })
export class Message extends CommonColumns {
  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'sender', referencedColumnName: 'id' })
  sender: User;
}
