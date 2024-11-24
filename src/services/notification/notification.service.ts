import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Notification } from './entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async find(options: FindManyOptions<Notification>) {
    return await this.notificationRepository.find(options);
  }

  async findOne(options: FindOneOptions<Notification>) {
    return await this.notificationRepository.findOne(options);
  }

  create(dto: Notification) {
    return this.notificationRepository.create(dto);
  }

  async save(dto: Notification | Notification[]) {
    if (Array.isArray(dto)) {
      return await this.notificationRepository.save(dto);
    } else {
      return await this.notificationRepository.save(dto);
    }
  }

  async update(dto: Notification) {
    const notification = await this.findOne({ where: { id: dto.id } });
    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${dto.id} wasn't not found`,
      );
    }

    Object.assign(notification, dto);
    const updatedNotification = await this.save(notification);

    return { success: true, data: updatedNotification };
  }

  async delete(id: string) {
    return await this.notificationRepository.delete(id);
  }
}
