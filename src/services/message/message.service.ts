import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Message } from './entity/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
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
}
