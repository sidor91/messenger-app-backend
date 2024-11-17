import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'username',
    description: `User's username, email, or phone number`,
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Login must be string!' })
  readonly login: string;

  @ApiProperty({
    example: 'P@ssword_1234',
    description: 'Password',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Password must be string!' })
  readonly password: string;
}
