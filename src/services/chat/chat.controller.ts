import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
import { GetUserChatsResponseDto } from './dto/get-user-chats.dto';
import { GetChatByIdResponseDto } from './dto/get-chat.dto';
import {
  AddOrDeleteUserEnum,
  AddOrDeleteUserToChatDto,
  AddUserToChatResponseDto,
} from './dto/add-or-delete-user.dto';
import { SuccessDto } from 'src/common/dto/success.dto';

@ApiTags('Chat API')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('user-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all chats by current user' })
  @ApiResponse({
    type: GetUserChatsResponseDto,
    isArray: true,
  })
  async getAllChatsByUserId(
    @GetCurrentUserId() userId: string,
    @Query() params?: PaginationDto,
  ) {
    return this.chatService.getAllChatsByUserId(userId, params);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat by id' })
  @ApiResponse({
    type: GetChatByIdResponseDto,
  })
  async getChatById(@Param('id') id: string, @Query() params?: PaginationDto) {
    return this.chatService.getChatById(id, params);
  }

  @Post('create-group')
  @ApiBearerAuth()
  @ApiResponse({
    type: CreateGroupChatResponseDto,
  })
  async createGroupChat(
    @Body() dto: CreateGroupChatDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.chatService.createNewGroupChat(dto, userId);
  }

  @Post('add-user')
  @ApiBearerAuth()
  @ApiResponse({
    type: AddUserToChatResponseDto,
  })
  async addUserToChat(@Body() dto: AddOrDeleteUserToChatDto) {
    return this.chatService.addOrDeleteUserToChat(dto, AddOrDeleteUserEnum.ADD);
  }

  @Post('delete-user')
  @ApiBearerAuth()
  @ApiResponse({
    type: SuccessDto,
  })
  async deleteUserFromChat(@Body() dto: AddOrDeleteUserToChatDto) {
    return this.chatService.addOrDeleteUserToChat(
      dto,
      AddOrDeleteUserEnum.DELETE,
    );
  }
}
