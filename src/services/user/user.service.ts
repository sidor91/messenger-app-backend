import { Injectable } from '@nestjs/common';

import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
