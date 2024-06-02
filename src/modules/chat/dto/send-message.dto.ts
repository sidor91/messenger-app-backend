import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { SuccessDto } from 'src/common/dto/success.dto';

export class SendMessageDto {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'chat id',
  })
  @IsString({ message: 'chat_id must be a string' })
  @IsOptional()
  chat_id?: string;

  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'message recipient id',
  })
  @IsArray({ message: 'Recipients are must be a string array' })
  recipient_id: string[];

  @ApiProperty({
    example: 'Hello World',
    description: 'message content',
  })
  text: string;
}

export class SendMessageResponseDto extends SuccessDto {
  @ApiProperty({
    example: 'The message was successfully sent',
    description: 'Send message response',
  })
  message: string;
}
