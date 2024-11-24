import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetCurrentUserId } from 'src/@decorators/getCurrentUserId.decorator';

import { ChatService } from './chat.service';

import {
  CreateGroupChatDto,
  CreateGroupChatResponseDto,
} from './dto/create-group-chat.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetUserChatResponseDto } from './dto/get-user-chats.dto';

@ApiTags('Chat API')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('user-chats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all chats by current user' })
  @ApiResponse({
    type: GetUserChatResponseDto,
    isArray: true,
  })
  async getUserChats(
    @GetCurrentUserId() userId: string,
    @Query() params?: PaginationDto,
  ) {
    return this.chatService.getAllChatsByUserId(userId, params);
  }

  @Post('create-group-chat')
  @ApiBearerAuth()
  @ApiResponse({
    type: CreateGroupChatResponseDto,
  })
  async createChat(
    @Body() dto: CreateGroupChatDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.chatService.createNewGroupChat(dto, userId);
  }
}
