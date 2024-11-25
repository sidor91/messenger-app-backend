import { ApiProperty } from "@nestjs/swagger";
import { CommonColumns } from "src/common/entities/common.entity";

export class MessageDto extends CommonColumns {
  @ApiProperty({
    example: 'Hello World!'
  })
  text: string;
}