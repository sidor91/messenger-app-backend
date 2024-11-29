import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'pagination page',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  page: string;

  @ApiProperty({
    example: 10,
    description: 'number of items per page',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  limit: string;
}
