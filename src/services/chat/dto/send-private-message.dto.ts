import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { SuccessDto } from 'src/common/dto/success.dto';

export class SendPrivateMessageDto {
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
  @IsString()
  @IsOptional()
  recipient?: string;

  @ApiProperty({
    example: 'Hello World',
    description: 'message content',
  })
  @IsString()
  text: string;
}

export class SendMessageResponseDto {
  @ApiProperty({
    example: 'The message was successfully sent',
    description: 'Send message response',
  })
  message: string;
}
