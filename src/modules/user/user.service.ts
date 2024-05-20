import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateUserDto, User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(request = {}): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: request });
  }

  async create(dto: User) {
    const user = await this.userRepository.save(dto);
    delete user.password_hash;
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, dto);
    const updatedUser = await this.create(user);

    return updatedUser;
  }
}
