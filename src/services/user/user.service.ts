import { In, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';

import { setCookies } from 'src/utils/cookies.util';
import {
  objectFieldRemoval,
  userFieldsToRemove,
} from 'src/utils/object-field-removal.util';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(request = {}) {
    return await this.userRepository.findOne({ where: request });
  }

  async findAll(request = {}) {
    return await this.userRepository.find({ where: request });
  }

  async getAllUsers() {
    const users = await this.findAll();
    if (users.length > 0) {
      return users.map((user) =>
        objectFieldRemoval(user, userFieldsToRemove.PASSWORD_AND_TOKENS),
      );
    }
    return users;
  }

  async findByIds(dto: string[]) {
    return await this.userRepository.findBy({ id: In(dto) });
  }

  async create(dto: User) {
    return await this.userRepository.save(dto);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, dto);
    const updatedUser = await this.create(user);

    const data = objectFieldRemoval(
      updatedUser,
      userFieldsToRemove.PASSWORD_AND_TOKENS,
    );

    return { success: true, data };
  }

  async delete(id: string, response: Response) {
    await this.userRepository.delete(id);
    setCookies('', response);
    return { success: true };
  }

  async current(userId: string) {
    const user = await this.findOne({ id: userId });

    const data = objectFieldRemoval(
      user,
      userFieldsToRemove.PASSWORD_AND_TOKENS,
    );

    return {
      success: true,
      data,
    };
  }
}
