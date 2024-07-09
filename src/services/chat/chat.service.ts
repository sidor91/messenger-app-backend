import { Repository } from 'typeorm';

import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageService } from '../message/message.service';
import { NotificationEnum } from '../notification/entity/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

import { SendMessageDto } from './dto/send-message.dto';
import { Chat } from './entity/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly notificationService: NotificationService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  async findOne(where = {}, relations: string[] = []) {
    return await this.chatRepository.findOne({ where, relations });
  }

  async create(dto: Chat) {
    return await this.chatRepository.save(dto);
  }

  async update(dto: Chat) {
    const chat = await this.findOne({ id: dto.id });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${dto.id} doesn't exist`);
    }

    Object.assign(chat, dto);
    const updatedChat = await this.create(chat);

    return { success: true, data: updatedChat };
  }

  async delete(id: string) {
    await this.chatRepository.delete(id);
    return { success: true };
  }

  getNotificationsForCurrentUser(chats: Chat[], userId: string) {
    return chats.map((chat) => {
      if (chat.notifications && chat.notifications.length) {
        chat.notifications = chat.notifications.filter((notification) => {
          if (notification.recipient?.id) {
            return notification.recipient.id !== userId;
          }
        });
        return chat;
      }
    });
  }

  async createNewChat(dto: Chat) {
    const { chat_members, is_group_chat } = dto;
    if (!is_group_chat) {
      const memberIds = chat_members.map((member) => member.id);
      const existingChat = await this.chatRepository
        .createQueryBuilder('chat')
        .innerJoin('chat.chat_members', 'member')
        .where('member.id IN (:...memberIds)', { memberIds })
        .groupBy('chat.id')
        .having('COUNT(member.id) = :memberCount', {
          memberCount: memberIds.length,
        })
        .getOne();

      if (existingChat) return false;
    }
    const newChat = await this.create(dto);
    return await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.chat_members', 'member')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoinAndSelect('chat.notifications', 'notification')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .where('chat.id = :id', { id: newChat.id })
      .getOne();
  }

  async getAllChatsByUserId(id: string) {
    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.chat_members', 'member')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoinAndSelect('chat.notifications', 'notification')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('chat.id')
          .from(Chat, 'chat')
          .leftJoin('chat.chat_members', 'user')
          .where('user.id = :id', { id })
          .getQuery();
        return 'chat.id IN ' + subQuery;
      })
      .select([
        'chat.id',
        'chat.name',
        'chat.is_group_chat',
        'chat.avatar',
        'member.id',
        'member.username',
        'member.username',
        'member.first_name',
        'member.last_name',
        'member.avatar',
        'member.is_online',
        'message.id',
        'message.created_at',
        'message.text',
        'message.is_edited',
        'notification.id',
        'notification.type',
        'recipient.id',
      ])
      .getMany();

    const chatsWithFilteredNotifications = this.getNotificationsForCurrentUser(
      chats,
      id,
    );

    return chatsWithFilteredNotifications;
  }

  async sendMessage(dto: SendMessageDto, currentUserId: string) {
    const { text, recipients } = dto;
    const is_group_chat = recipients.length > 1;
    try {
      let chat: Chat;
      let chat_members: User[];

      if (dto.chat_id) {
        chat = await this.chatRepository
          .createQueryBuilder('chat')
          .leftJoinAndSelect('chat.chat_members', 'chat_members')
          .where('chat.id = :id', { id: dto.chat_id })
          .getOne();
        if (!chat)
          throw new HttpException(
            `Chat with such id ${dto.chat_id} doesn't exists`,
            HttpStatus.BAD_REQUEST,
          );
        chat_members = chat.chat_members;
      } else {
        chat_members = await this.userService.findByIds([
          ...recipients,
          currentUserId,
        ]);
        chat = await this.create({ chat_members, is_group_chat });
      }

      const message = await this.messageService.create({
        text,
        chat,
        sender: currentUserId,
      });

      const recipient_list = chat_members.filter(
        ({ id }) => id !== currentUserId,
      );

      for (const recipient of recipient_list) {
        await this.notificationService.create({
          message,
          chat,
          recipient,
          type: NotificationEnum.NEW_MESSAGE,
        });
      }

      return {
        success: true,
        message: `The message was successfully sent`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
