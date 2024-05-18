import {
  Column,
  Entity,
  // JoinColumn, OneToMany
} from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
import { PartialType } from '@nestjs/swagger';
// import { Order } from 'src/order/entities/order.entity';
// import { Transaction } from 'src/transaction/entities/transaction.entity';

@Entity({ name: 'users' })
export class User extends CommonColumns {
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password_hash: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  first_name?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  last_name?: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
    default: null,
  })
  phone?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  refresh_token?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  access_token?: string;

  // @OneToMany(() => Order, (orders) => orders.user)
  // @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  // orders: Order[];

  // @OneToMany(() => Transaction, (transactions) => transactions.user)
  // @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  // transactions: Transaction;
}

export class UpdateUserDto extends PartialType(User) {}
