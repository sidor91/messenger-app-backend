import { ApiProperty } from '@nestjs/swagger';
import { SuccessDto } from 'src/common/dto/success.dto';

export class RefreshTokenResponseDto extends SuccessDto {
  @ApiProperty({
    example: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzMTMzYjMyLTBlODAtNGE3Mi1hYjBlLWY5ZDBjYWI1NjM0NSIsImFkZHJlc3MiOiIweGUzNjMxNkZiREVFOWY5Q0M5MkM0YkRhOEQxRTY4MmY1QTk3RjkxMGUiLCJpYXQiOjE3MTI2ODI3MzMsImV4cCI6MTcxMjY4MzYzM30.3ccOn-WmMO668C2lUPWkgVvCT9Ej81ZkY1Jnctri--E',
    },
    description: 'Object containing new JWT access token',
  })
  readonly data: { access_token: string };
}
