import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class CreateGroupChatDto {
  @ApiProperty({
    isArray: true,
    example: [
      '64bb7b28-e39b-47e3-8ef9-173366cb0b43',
      '9fd26aad-f91f-4e3e-89a8-b45306af9b47',
      'ed8ce60b-bb0a-40ca-a075-688287617d0a',
    ],
  })
  @IsArray()
  userIds: string[];
}