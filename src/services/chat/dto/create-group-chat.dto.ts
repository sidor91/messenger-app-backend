import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserDto } from "src/services/user/dto/user.dto";
import { ChatDto } from "./chat.dto";

export class CreateGroupChatDto {
  @ApiProperty({
    type: String,
    isArray: true,
    example: [
      '64bb7b28-e39b-47e3-8ef9-173366cb0b43',
      '9fd26aad-f91f-4e3e-89a8-b45306af9b47',
      'ed8ce60b-bb0a-40ca-a075-688287617d0a',
    ],
  })
  @IsArray()
  @IsNotEmpty()
  userIds: string[];

  @ApiProperty({
    type: String,
    example: 'Friends'
  })
  @IsString()
  @IsOptional()
  name?: string
}

export class CreateGroupChatResponseDto extends ChatDto {
  @ApiProperty({
    type: UserDto,
  })
  admin: UserDto;

  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  users: UserDto[];
}
