import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';


export class UserRegisterDto {
  @ApiProperty({
    example: 'username',
    description: 'Username',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Username must be string!' })
  readonly username: string;

  @ApiProperty({
    example: 'P@ssword_1234',
    description: 'Password',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsString({ message: 'Password must be string!' })
  readonly password: string;

  @ApiProperty({
    example: 'example@mail.com',
    description: 'Email',
  })
  @IsNotEmpty({ message: 'Must be fulfilled!' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '+12345678901',
    description: 'Phone number',
  })
  @IsOptional()
  @IsPhoneNumber()
  readonly phone: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsOptional()
  @IsString()
  readonly first_name: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Last name',
  })
  @IsOptional()
  @IsString()
  readonly last_name: string;
}
