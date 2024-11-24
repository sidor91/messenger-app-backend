import { Body, Controller, Post } from '@nestjs/common';

import { MessageService } from './message.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';
import { SendMessageResponseDto, SendPrivateMessageDto } from './dto/send-private-message.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';

@ApiTags('Message API')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('new-private-message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to private chat' })
  @ApiResponse({
    type: SendMessageResponseDto,
  })
  async sendPrivateMessage(
    @Body() dto: SendPrivateMessageDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.messageService.sendPrivateMessage(dto, userId);
  }

  @Post('new-group-message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to group chat' })
  @ApiResponse({
    type: SendMessageResponseDto,
  })
  async sendGroupMessage(
    @Body() dto: SendGroupMessageDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.messageService.sendGroupMessage(dto, userId);
  }
}
