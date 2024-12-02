import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/services/chat/entity/chat.entity';
import { User } from 'src/services/user/entity/user.entity';

@Entity({ name: 'messages' })
export class Message extends CommonColumns {
  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'sender', referencedColumnName: 'id' })
  sender: User;

  @ManyToMany(() => User, (user) => user.id)
  @JoinTable({
    name: 'message_recipients',
    joinColumn: { name: 'message_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  recipients: User[];
}
