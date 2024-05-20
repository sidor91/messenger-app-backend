import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entity/user.entity';

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
    return await this.userRepository.save(dto);
  }
}
