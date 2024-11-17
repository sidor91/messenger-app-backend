import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

export abstract class CommonColumns {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'unique id',
  })
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ApiProperty({
    example: '2024-05-20 16:42:02.966148+03',
    description: 'created at',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at?: Date;

  @ApiProperty({
    example: '2024-05-20 16:42:02.966148+03',
    description: 'updated at',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at?: Date;
}
