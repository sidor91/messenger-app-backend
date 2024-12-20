import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPagination } from 'src/utils/pagination.util';

import { ChatService } from '../chat/chat.service';
import { Chat } from '../chat/entity/chat.entity';
import {
  DbTransactionService,
  SingleEntityValue,
} from '../db-transaction/db-transaction.service';
import { NotificationEnum } from '../notification/dto/notification.dto';
import { Notification } from '../notification/entity/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { SendMessageResponse } from './dto/send-message-response.dto';
import { SendPrivateMessageDto } from './dto/send-private-message.dto';
import { Message } from './entity/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly dbTransactionService: DbTransactionService,
  ) {}

  async findOne(options: FindOneOptions<Message>) {
    return await this.messageRepository.findOne(options);
  }

  async find(options: FindManyOptions<Message>) {
    return await this.messageRepository.find(options);
  }

  async save(dto: Message) {
    return await this.messageRepository.save(dto);
  }

  create(dto: Message) {
    return this.messageRepository.create(dto);
  }

  async update(dto: Message) {
    const message = await this.findOne({ where: { id: dto.id } });
    if (!message) {
      throw new HttpException(
        `Message with ID ${dto.id} wasn't not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(message, dto);
    return await this.save(message);
  }

  async delete(id: string) {
    await this.messageRepository.delete(id);
  }

  public async sendPrivateMessage(
    dto: SendPrivateMessageDto,
    currentUserId: string,
  ): Promise<SendMessageResponse> {
    const { text, recipient, chat_id } = dto;

    if (!recipient && !chat_id) {
      throw new HttpException(
        `Request must have either a recipient or a chat_id`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const users = await this.userService.findAll({
      where: { id: In([recipient, currentUserId]) },
    });

    if (users.length < 2)
      throw new HttpException(`Recipient not found`, HttpStatus.NOT_FOUND);

    let chat: Chat;

    if (chat_id) {
      chat = await this.chatService.findOne({
        where: { id: chat_id },
      });
      if (!chat)
        throw new HttpException(
          `Chat with such id ${chat_id} doesn't exists`,
          HttpStatus.NOT_FOUND,
        );
    } else {
      const existingChat = await this.chatService.checkIsPrivateChatExists([
        recipient,
        currentUserId,
      ]);
      if (existingChat) {
        chat = existingChat;
      } else {
        chat = this.chatService.create({
          users,
          is_group_chat: false,
        });
      }
    }

    const { senderDbEntry, recipientDbEntry } = users.reduce(
      (acc, user) => {
        if (user.id === currentUserId) {
          acc.senderDbEntry = user;
        } else {
          acc.recipientDbEntry = user;
        }
        return acc;
      },
      { senderDbEntry: null, recipientDbEntry: null },
    );

    const message = this.create({
      text,
      chat,
      sender: senderDbEntry,
      recipients: [recipientDbEntry],
    });

    const notification = this.notificationService.create({
      message,
      chat,
      recipient: recipientDbEntry,
      type: NotificationEnum.NEW_MESSAGE,
    });

    const result = await this.dbTransactionService.saveEntitiesInTransaction(
      { message, chat, notification },
      ['chat', 'message', 'notification'],
    );

    return {
      message_id: (result.message as SingleEntityValue).id,
      text,
      sender: senderDbEntry,
      chat_id: (result.chat as SingleEntityValue).id,
    };
  }

  public async sendGroupMessage(
    dto: SendGroupMessageDto,
    currentUserId: string,
  ): Promise<SendMessageResponse> {
    const { text, chat_id } = dto;

    const chat = await this.chatService.findOne({
      where: { id: chat_id },
      relations: ['users'],
    });

    if (!chat)
      throw new HttpException(
        `Chat with such id ${chat_id} doesn't exists`,
        HttpStatus.BAD_REQUEST,
      );

    const {
      senderDbEntry,
      recipientsDbArr,
    }: { senderDbEntry: User; recipientsDbArr: User[] } = chat.users.reduce(
      (acc, user) => {
        if (user.id === currentUserId) {
          acc.senderDbEntry = user;
        } else {
          acc.recipientsDbArr.push(user);
        }
        return acc;
      },
      { senderDbEntry: null, recipientsDbArr: [] },
    );

    const message = this.create({
      text,
      chat,
      sender: senderDbEntry,
      recipients: recipientsDbArr,
    });

    const notifications = this.createMessageNotifications(
      chat,
      message,
      NotificationEnum.NEW_MESSAGE,
    );
    const result = await this.dbTransactionService.saveEntitiesInTransaction(
      { message, notification: notifications },
      ['message', 'notification'],
    );

    return {
      message_id: (result.message as SingleEntityValue).id,
      text,
      sender: senderDbEntry,
      chat_id,
    };
  }

  public async getMessagesByChatId(id: string, params?: PaginationDto) {
    const { skip, take } = getPagination(params);

    const [messages, messagesCount] = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.chat', 'chat')
      .leftJoin('message.sender', 'sender')
      .addSelect(['sender.id', 'sender.username', 'sender.avatar'])
      .where('chat.id = :id', { id })
      .orderBy('message.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { messages, messagesCount };
  }

  private createMessageNotifications(
    chat: Chat,
    message: Message,
    notificationType: NotificationEnum,
  ): Notification[] {
    const { recipients } = message;

    return recipients.map((recipient) =>
      this.notificationService.create({
        type: notificationType,
        message,
        recipient,
        chat,
      }),
    );
  }
}
