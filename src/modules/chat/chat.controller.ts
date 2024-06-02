import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/@decorators/public.decorator';
import { SendMessageDto, SendMessageResponseDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';

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
