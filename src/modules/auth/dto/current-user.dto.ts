import { ApiProperty } from "@nestjs/swagger";
import { SuccessDto } from "src/common/dto/success.dto";

export class CurrentUserResponseDto extends SuccessDto {
  @ApiProperty({
    example: '2312ff46-d975-488d-a862-941568e0e158',
    description: 'user id',
  })
  readonly user_id: string;
}