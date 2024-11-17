import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';

import { ChatService } from './chat.service';
import { SendMessageDto, SendMessageResponseDto } from './dto/send-message.dto';

@ApiTags('Chat API')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('new-message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to chat' })
  @ApiResponse({
    type: SendMessageResponseDto,
  })
  async sendPrivateMessage(
    @Body() dto: SendMessageDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.chatService.sendMessage(dto, userId);
  }
}
