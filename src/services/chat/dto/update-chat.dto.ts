import { Column } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'Chat id',
  })
  @IsString({ message: 'Chat id must be a string' })
  chat_id: string;

  @ApiProperty({
    example: 'chatname',
    description: 'chat name',
  })
  @Column({ type: 'varchar', nullable: true })
  @IsString({ message: 'Chat name must be a string' })
  name?: string;
}
