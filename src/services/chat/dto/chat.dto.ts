import { ApiProperty } from "@nestjs/swagger";
import { CommonColumns } from "src/common/entities/common.entity";

export class ChatDto extends CommonColumns {
  @ApiProperty({
    example: 'Friends',
  })
  name?: string;

  @ApiProperty({
    example: true,
  })
  is_group_chat: boolean;

  @ApiProperty({
    example: 'https://example.com/1234',
  })
  avatar: string;
}
