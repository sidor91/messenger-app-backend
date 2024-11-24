import { IsString } from "class-validator";

export class ValidateUserDto {
  @IsString()
  id: string;

  @IsString()
  password_hash: string;
  
  @IsString()
  access_token: string;
}