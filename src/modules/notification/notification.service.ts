import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) { }
  
  async findOne(request = {}) {
    return await this.notificationRepository.findOne({ where: request });
  }

  async create(dto: Notification) {
    return await this.notificationRepository.save(dto);
  }

  async update(dto: Notification) {
    const notification = await this.findOne({ id: dto.id });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${dto.id} wasn't not found`);
    }

    Object.assign(notification, dto);
    const updatedNotification = await this.create(notification);

    return { success: true, data: updatedNotification };
  }

  async delete(id: string) {
    await this.notificationRepository.delete(id);
    return { success: true };
  }
}
