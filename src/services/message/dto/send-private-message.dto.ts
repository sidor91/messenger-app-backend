import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendPrivateMessageDto {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'chat id',
  })
  @IsString({ message: 'chat_id must be a string' })
  @IsOptional()
  chat_id?: string;

  @ApiProperty({
    example: '64bb7b28-e39b-47e3-8ef9-173366cb0b43',
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
