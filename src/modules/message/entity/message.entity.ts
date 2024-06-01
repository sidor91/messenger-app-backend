import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/modules/chat/entity/chat.entity';
import { User } from 'src/modules/user/entity/user.entity';

@Entity({ name: 'messages' })
export class Message extends CommonColumns {
  @ApiProperty({
    example: 'Hello World',
    description: 'message content',
  })
  @Column({ type: 'text' })
  text: string;

  @ApiProperty({
    example: 'false',
    description: 'Was the message edited',
  })
  @Column({ type: 'boolean', default: false })
  is_edited?: boolean;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat?: Chat;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'sender', referencedColumnName: 'id' })
  sender: string;
}
