import { Brackets, FindOneOptions, In, Repository } from 'typeorm';

import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPagination } from 'src/utils/pagination.util';

import { MessageService } from '../message/message.service';
import { NotificationEnum } from '../notification/dto/notification.dto';
import { Notification } from '../notification/entity/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';

import {
  AddOrDeleteUserEnum,
  AddOrDeleteUserToChatDto,
} from './dto/add-or-delete-user.dto';
import { ChatWithUsersDto } from './dto/chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { Chat } from './entity/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async findOne(options: FindOneOptions<Chat>) {
    return await this.chatRepository.findOne(options);
  }

  async save(dto: Chat) {
    return await this.chatRepository.save(dto);
  }

  public create(dto: Chat) {
    return this.chatRepository.create(dto);
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

  public async getUserChatIdsByUserId(userId: string): Promise<string[]> {
    const chatIds = await this.chatRepository
      .createQueryBuilder('chat')
      .select('chat.id')
      .innerJoin('chat.users', 'user')
      .where('user.id = :id', { id: userId })
      .getRawMany();

    return chatIds.map((chat) => chat.id);
  }

  async createNewGroupChat(dto: CreateGroupChatDto, userId: string) {
    const { userIds } = dto;

    const usersInDb = await this.userService.findAll({
      where: { id: In(userIds) },
    });

    if (usersInDb.length !== userIds.length) {
      throw new HttpException(
        'Some users do not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const admin = usersInDb.find((user) => user.id === userId);

    const newChat = this.chatRepository.create({
      is_group_chat: true,
      users: usersInDb,
      admin,
    });

    const notifications: Notification[] = this.createChatNotifications(
      {
        ...newChat,
        users: usersInDb.filter((user) => user.id !== userId),
      } as ChatWithUsersDto,
      NotificationEnum.ADDED_TO_CHAT,
    );

    return await this.saveChatWithNotifications(newChat, notifications);
  }

  async getAllChatsByUserId(id: string, paginationaParams?: PaginationDto) {
    const pagination = getPagination(paginationaParams);
    const { skip, take } = pagination;

    const [chats, chatsCount] = await this.chatRepository
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
      .getManyAndCount();

    return { chats, chatsCount };
  }

  public async getChatById(id: string, params?: PaginationDto) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.users', 'user')
      .addSelect(['user.id', 'user.avatar', 'user.username'])
      .getOne();

    if (!chat) {
      throw new NotFoundException(`Chat with id ${id} wasn't found`);
    }

    const messages = await this.messageService.getMessagesByChatId(id, params);

    return { ...chat, messages };
  }

  public async addOrDeleteUserToChat(
    dto: AddOrDeleteUserToChatDto,
    addOrDelete: AddOrDeleteUserEnum,
  ) {
    const { userId, chatId } = dto;
    const isDelete = addOrDelete === AddOrDeleteUserEnum.DELETE;

    const chat = await this.findOne({
      where: { id: chatId },
      relations: { users: true },
    });

    if (!chat) {
      throw new HttpException(
        `The chat with id ${chatId} doesn't exists`,
        HttpStatus.NOT_FOUND,
      );
    }

    const isUserInChat = chat.users.some((user) => user.id === userId);

    if (isDelete && !isUserInChat) {
      throw new HttpException(
        `The user with id ${userId} is not in the chat ${chatId}`,
        HttpStatus.NOT_FOUND,
      );
    } else if (!isDelete && isUserInChat) {
      throw new HttpException(
        `The user with id ${userId} is already in the chat`,
        HttpStatus.CONFLICT,
      );
    }

    let notifications: Notification[];

    if (isDelete) {
      chat.users = chat.users.filter((user) => user.id !== userId);
      notifications = this.createChatNotifications(
        chat as ChatWithUsersDto,
        NotificationEnum.DELETE_USER_FROM_CHAT,
      );
      notifications = this.createChatNotifications(
        chat as ChatWithUsersDto,
        NotificationEnum.DELETE_USER_FROM_CHAT,
      );
    } else {
      const user = await this.userService.findOne({ where: { id: userId } });
      notifications = this.createChatNotifications(
        chat as ChatWithUsersDto,
        NotificationEnum.NEW_USER_IN_CHAT,
      );
      chat.users.push(user);
    }

    return await this.saveChatWithNotifications(chat, notifications);
  }

  public async checkIsPrivateChatExists(userIds: string[]) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'user')
      .where('chat.is_group_chat = :is_group_chat', { is_group_chat: false })
      .andWhere('user.id IN (:...userIds)', { userIds })
      .groupBy('chat.id')
      .having('COUNT(user.id) = :userCount', { userCount: userIds.length })
      .getOne();
    return chat;
  }

  private createChatNotifications(
    chat: Chat,
    notificationType: NotificationEnum,
  ): Notification[] {
    const { users } = chat;

    return users.map((user) =>
      this.notificationService.create({
        type: notificationType,
        chat,
        recipient: user,
      }),
    );
  }

  private async saveChatWithNotifications(
    chat: Chat,
    notifications: Notification[],
  ): Promise<Chat> {
    const queryRunner =
      this.chatRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(chat);
      await queryRunner.manager.save(notifications);
      return chat;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        `${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
