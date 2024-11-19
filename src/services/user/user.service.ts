import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';

import { setCookies } from 'src/utils/cookies.util';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findOne(options: FindOneOptions<User>) {
    return await this.userRepository.findOne(options);
  }

  async findAll(options: FindManyOptions<User> = {}) {
    return await this.userRepository.find(options);
  }

  async save(dto: User) {
    return await this.userRepository.save(dto);
  }

  create(dto: User) {
    return this.userRepository.create(dto);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.save({...user, ...dto})

    return { success: true, data: updatedUser };
  }

  async delete(id: string, response: Response) {
    await this.userRepository.delete(id);
    setCookies('', response);
    return { success: true };
  }

  async current(userId: string) {
    const user = await this.findOne({ where: { id: userId } });

    return {
      success: true,
      data: user,
    };
  }
}
