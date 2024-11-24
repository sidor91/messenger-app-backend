import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Message } from './entity/message.entity';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import {
  SendMessageResponseDto,
  SendPrivateMessageDto,
} from './dto/send-private-message.dto';
import { Chat } from '../chat/entity/chat.entity';
import { User } from '../user/entity/user.entity';
import { ChatService } from '../chat/chat.service';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationEnum } from '../notification/entity/notification.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPagination } from 'src/utils/pagination.util';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
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

  async update(dto: Message) {
    const message = await this.findOne({ where: { id: dto.id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${dto.id} wasn't not found`);
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
  ): Promise<SendMessageResponseDto> {
    const { text, recipient, chat_id } = dto;

    if (!recipient && !chat_id) {
      throw new HttpException(
        `Request must have either a recipient or a chat_id`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let chat: Chat;

    if (chat_id) {
      chat = await this.chatService.findOne({
        where: { id: chat_id },
        relations: ['users'],
      });
      if (!chat)
        throw new HttpException(
          `Chat with such id ${chat_id} doesn't exists`,
          HttpStatus.BAD_REQUEST,
        );
    } else {
      const users = await this.userService.findAll({
        where: { id: In([recipient, currentUserId]) },
      });
      chat = await this.chatService.save({ users, is_group_chat: false });
    }

    const { senderDbEntry, recipientDbEntry } = chat.users.reduce(
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

    const message = await this.save({
      text,
      chat,
      sender: senderDbEntry,
      recipients: [recipientDbEntry],
    });

    await this.notificationService.save({
      message,
      chat,
      recipient: recipientDbEntry,
      type: NotificationEnum.NEW_MESSAGE,
    });

    return {
      message: `The message was sent successfully`,
    };
  }

  public async sendGroupMessage(
    dto: SendGroupMessageDto,
    currentUserId: string,
  ): Promise<SendMessageResponseDto> {
    try {
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

      const message = await this.save({
        text,
        chat,
        sender: senderDbEntry,
        recipients: recipientsDbArr,
      });

      const notifications = recipientsDbArr.map((recipient) =>
        this.notificationService.create({
          message,
          chat,
          recipient,
          type: NotificationEnum.NEW_MESSAGE,
        }),
      );

      await this.notificationService.save(notifications);

      return {
        message: `The message was successfully sent`,
      };
    } catch (error) {
      console.log(error);
    }
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
}
