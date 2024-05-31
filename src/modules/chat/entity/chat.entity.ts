import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Message } from 'src/modules/message/entity/message.entity';
import { User } from 'src/modules/user/entity/user.entity';

@Entity({ name: 'chats' })
export class Chat extends CommonColumns {
  @ApiProperty({
    example: 'chatname',
    description: 'chat name',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    example: 'false',
    description: 'Is personal or group chat',
  })
  @Column({ type: 'boolean' })
  is_group_chat: boolean;

  @ApiProperty({
    example: 'https://somedomain/:avatarid',
    description: 'Avatar Url',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  avatar?: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'admin', referencedColumnName: 'id' })
  admin: User;

  @ManyToMany(() => User, (user) => user.member_of_chats)
  @JoinTable({
    name: 'chat_members',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  chat_members: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
