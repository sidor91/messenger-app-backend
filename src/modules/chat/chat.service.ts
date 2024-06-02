import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entity/chat.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../user/entity/user.entity';
import { NotificationService } from '../notification/notification.service';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';
import { NotificationEnum } from '../notification/entity/notification.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly notificationService: NotificationService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  async findOne(request = {}) {
    return await this.chatRepository.findOne({ where: request });
  }

  async create(dto: Chat) {
    return await this.chatRepository.save(dto);
  }

  async update(dto: Chat) {
    const chat = await this.findOne({ id: dto.id });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${dto.id} wasn't not found`);
    }

    Object.assign(chat, dto);
    const updatedChat = await this.create(chat);

    return { success: true, data: updatedChat };
  }

  async delete(id: string) {
    await this.chatRepository.delete(id);
    return { success: true };
  }

  async sendMessage(dto: SendMessageDto, userId: string) {
    const { text, recipient_id } = dto;
    const is_group_chat = recipient_id.length > 1;
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
          ...recipient_id,
          userId,
        ]);
        chat = await this.create({ chat_members, is_group_chat });
      }

      const message = await this.messageService.create({
        text,
        chat,
        sender: userId,
      });

      const recipients = chat_members.filter(({ id }) => id !== userId);

      for (const recipient of recipients) {
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
