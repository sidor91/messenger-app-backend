import { ApiProperty } from '@nestjs/swagger';

export class CommonDto {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'unique id',
  })
  id?: string;

  @ApiProperty({
    example: '2024-05-20 16:42:02.966148+03',
    description: 'created at',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2024-05-20 16:42:02.966148+03',
    description: 'updated at',
  })
  updated_at?: Date;
}
