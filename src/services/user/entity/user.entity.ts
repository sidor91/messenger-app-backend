import { Column, Entity, ManyToMany } from 'typeorm';

import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

import { CommonColumns } from 'src/common/entities/common.entity';
import { Chat } from 'src/services/chat/entity/chat.entity';

@Entity({ name: 'users' })
export class User extends CommonColumns {
  @ApiProperty({
    example: 'username',
    description: 'Username',
  })
  @Column({ type: 'varchar', unique: true })
  username: string;

  @ApiProperty({
    example: 'example@mail.com',
    description: 'Email',
  })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({
    example: '$2b$11$zornCcfwUPX0Hvbhqge/f.AGgdROClbDjM3Qs8JhOP3yCZfjKo.w2',
    description: 'Password',
  })
  @Column({ type: 'varchar' })
  password_hash: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  first_name?: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Last name',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  last_name?: string;

  @ApiProperty({
    example: '+12345678901',
    description: 'Phone number',
  })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
    default: null,
  })
  phone?: string;

  @ApiProperty({
    example: 'https://somedomain/:avatarid',
    description: 'Avatar Url',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  avatar?: string;

  @ApiProperty({
    example: 'true',
    description: 'Is user online',
  })
  @Column({ type: 'boolean', default: false })
  is_online?: boolean;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzMTMzYjMyLTBlODAtNGE3Mi1hYjBlLWY5ZDBjYWI1NjM0NSIsImFkZHJlc3MiOiIweGUzNjMxNkZiREVFOWY5Q0M5MkM0YkRhOEQxRTY4MmY1QTk3RjkxMGUiLCJpYXQiOjE3MTI2ODI3MzMsImV4cCI6MTcxMjY4MzYzM30.3ccOn-WmMO668C2lUPWkgVvCT9Ej81ZkY1Jnctri--E',
    description: 'Refresh token',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  refresh_token?: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzMTMzYjMyLTBlODAtNGE3Mi1hYjBlLWY5ZDBjYWI1NjM0NSIsImFkZHJlc3MiOiIweGUzNjMxNkZiREVFOWY5Q0M5MkM0YkRhOEQxRTY4MmY1QTk3RjkxMGUiLCJpYXQiOjE3MTI2ODI3MzMsImV4cCI6MTcxMjY4MzYzM30.3ccOn-WmMO668C2lUPWkgVvCT9Ej81ZkY1Jnctri--E',
    description: 'Access token',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  access_token?: string;

  @ManyToMany(() => Chat, (chat) => chat.chat_members)
  member_of_chats?: Chat[];
}

export class PartialUserDto extends PartialType(User) {}

export class UserWithoutPassword extends OmitType(User, [
  'password_hash',
] as const) {}

export class UserWithoutConfidentialDataDto extends OmitType(User, [
  'access_token',
  'refresh_token',
  'password_hash',
] as const) {}
