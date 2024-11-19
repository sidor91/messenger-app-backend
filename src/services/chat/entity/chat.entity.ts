import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Message } from 'src/services/message/entity/message.entity';
import { Notification } from 'src/services/notification/entity/notification.entity';
import { User } from 'src/services/user/entity/user.entity';

@Entity({ name: 'chats' })
export class Chat extends CommonColumns {
  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'boolean', default: false })
  is_group_chat: boolean;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'admin', referencedColumnName: 'id' })
  admin?: User;

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable({
    name: 'chat_members',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users?: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages?: Message[];

  @OneToMany(() => Notification, (notification) => notification.chat)
  notifications?: Notification[];
}
