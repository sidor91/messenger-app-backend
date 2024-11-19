import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { User } from 'src/services/user/entity/user.entity';
import { PartialType } from '@nestjs/swagger';

@Entity({ name: 'auth' })
export class Auth extends CommonColumns {
  @Column({ type: 'varchar' })
  password_hash: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  refresh_token?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  access_token?: string;

  @OneToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}

export class PartialAuthDto extends PartialType(Auth) {}