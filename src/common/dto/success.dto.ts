import { ApiProperty } from '@nestjs/swagger';

export class SuccessDto {
  @ApiProperty({
    example: 'true',
    description: 'status',
  })
  success: boolean;
}
