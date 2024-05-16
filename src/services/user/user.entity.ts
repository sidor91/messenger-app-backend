import {
  Column,
  Entity,
  // JoinColumn, OneToMany
} from 'typeorm';

import { CommonColumns } from 'src/common/entities/common.entity';
// import { Order } from 'src/order/entities/order.entity';
// import { Transaction } from 'src/transaction/entities/transaction.entity';

@Entity({ name: 'users' })
export class User extends CommonColumns {
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  first_name: string;

  @Column({ type: 'varchar' })
  last_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'varchar' })
  password_hash: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  refresh_token: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  access_token: string;

  @Column({ type: 'varchar', nullable: true, name: 'avatar', default: null })
  avatar: string;

  // @OneToMany(() => Order, (orders) => orders.user)
  // @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  // orders: Order[];

  // @OneToMany(() => Transaction, (transactions) => transactions.user)
  // @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  // transactions: Transaction;
}
