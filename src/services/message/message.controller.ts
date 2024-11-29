import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';

import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { SendMessageResponse } from './dto/send-message-response.dto';
import { SendPrivateMessageDto } from './dto/send-private-message.dto';
import { MessageService } from './message.service';

@ApiTags('Message API')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('new-private-message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to private chat' })
  @ApiResponse({
    type: SendMessageResponse,
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
    type: SendMessageResponse,
  })
  async sendGroupMessage(
    @Body() dto: SendGroupMessageDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.messageService.sendGroupMessage(dto, userId);
  }
}
