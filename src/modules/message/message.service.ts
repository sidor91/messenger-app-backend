import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Message } from './entity/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findOne(request = {}) {
    return await this.messageRepository.findOne({
      where: request,
    });
  }

  async create(dto: Message) {
    return await this.messageRepository.save(dto);
  }

  async update(dto: Message) {
    const message = await this.findOne({ id: dto.id });
    if (!message) {
      throw new NotFoundException(`Message with ID ${dto.id} wasn't not found`);
    }

    Object.assign(message, dto);
    const updatedMessage = await this.create(message);

    return { success: true, data: updatedMessage };
  }

  async delete(id: string) {
    await this.messageRepository.delete(id);
    return { success: true };
  }
}
