import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class AuthUserDto {
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
}

// export class AuthUserResponseDto {
//   @ApiProperty({
//     example: true,
//     description: 'success status',
//   })
//   readonly success: boolean;

//   @ApiProperty({
//     example: {
//       accessToken:
//         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzMTMzYjMyLTBlODAtNGE3Mi1hYjBlLWY5ZDBjYWI1NjM0NSIsImFkZHJlc3MiOiIweGUzNjMxNkZiREVFOWY5Q0M5MkM0YkRhOEQxRTY4MmY1QTk3RjkxMGUiLCJpYXQiOjE3MTI2ODI3MzMsImV4cCI6MTcxMjY4MzYzM30.3ccOn-WmMO668C2lUPWkgVvCT9Ej81ZkY1Jnctri--E',
//       refreshToken:
//         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ZDdkZjllZC0zOGRkLTQxNmItOTgwNy1kYzRlNmM3ZWI0M2IiLCJlbWFpbCI6Imdvb2R0MW1lNDg1MUBnbWFpbC5jb20iLCJpYXQiOjE3MDI0MDEzNDUsImV4cCI6MTcwMzAwNjE0NX0.nay2X7v-nx1QKFZ_wub1N9kCxcqz8z5jtYG1W0RutVM',
//     },
//     description: 'Object containing both JWT access and refresh tokens',
//   })
//   readonly tokens: { accessToken: string; refreshToken: string };
// }
