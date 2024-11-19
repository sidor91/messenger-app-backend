import { Column, Entity, ManyToMany } from 'typeorm';

import { PartialType } from '@nestjs/swagger';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/services/chat/entity/chat.entity';

@Entity({ name: 'users' })
export class User extends CommonColumns {
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  first_name?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  last_name?: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
    default: null,
  })
  phone?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  avatar?: string;

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats?: Chat[];
}

export class PartialUserDto extends PartialType(User) {}
