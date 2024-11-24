import { Brackets, FindOneOptions, In, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Notification,
  NotificationEnum,
} from '../notification/entity/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';

import { Chat } from './entity/chat.entity';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPagination } from 'src/utils/pagination.util';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async findOne(options: FindOneOptions<Chat>) {
    return await this.chatRepository.findOne(options);
  }

  async save(dto: Chat) {
    return await this.chatRepository.save(dto);
  }

  async update(dto: Chat) {
    const chat = await this.findOne({ where: { id: dto.id } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${dto.id} doesn't exist`);
    }

    Object.assign(chat, dto);

    return await this.save(chat);
  }

  async delete(id: string) {
    await this.chatRepository.delete(id);
    return { success: true };
  }

  async createNewGroupChat(dto: CreateGroupChatDto, userId: string) {
    const { userIds } = dto;

    const usersInDb = await this.userService.findAll({
      where: { id: In(userIds) },
    });

    const admin = usersInDb.find((user) => user.id === userId);

    const newChat = await this.save({
      is_group_chat: true,
      users: usersInDb,
      admin,
    });

    const newChatNotifications: Notification[] = usersInDb.map((user) => ({
      type: NotificationEnum.ADDED_TO_CHAT,
      chat: newChat,
      recipient: user,
    }));

    await this.notificationService.save(newChatNotifications);

    return newChat;
  }

  async getAllChatsByUserId(id: string, paginationaParams?: PaginationDto) {
    const pagination = getPagination(paginationaParams);
    const { skip, take } = pagination;

    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect(
        'chat.notifications',
        'notification',
        'notification.recipient_id = :id',
        { id },
      )
      .leftJoinAndSelect('chat.users', 'user', 'user.id != :id', { id })
      .leftJoinAndSelect('chat.messages', 'message')
      .where(
        'chat.id IN (SELECT chat_id FROM chat_members WHERE user_id = :id)',
        { id },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where((subQb) => {
            const subQuery = subQb
              .subQuery()
              .select('MAX(m.created_at)')
              .from('messages', 'm')
              .where('m.chat_id = chat.id')
              .getQuery();
            return `message.created_at = (${subQuery})`;
          }).orWhere('message.id IS NULL');
        }),
      )
      .orderBy(`message.created_at`, 'DESC', 'NULLS LAST')
      .addOrderBy('chat.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    return chats;
  }
}
