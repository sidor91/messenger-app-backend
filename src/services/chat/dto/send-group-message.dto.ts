import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendGroupMessageDto {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'chat id',
  })
  @IsString()
  chat_id: string;

  @ApiProperty({
    example: 'Hello World',
    description: 'message content',
  })
  @IsString()
  text: string;
}
