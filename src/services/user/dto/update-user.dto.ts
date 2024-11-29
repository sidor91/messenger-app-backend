import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

import { CommonDto } from 'src/common/dto/common.dto';
import { SuccessDto } from 'src/common/dto/success.dto';

export class UpdateUserDto {
  @ApiProperty({
    example: 'username',
    description: 'Username',
  })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({
    example: 'email@example.com',
    description: 'email',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Ryan',
    description: 'first name',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    example: 'Ghosling',
    description: 'last name',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    example: '+12345678912',
    description: 'phone number',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/123',
    description: 'avatar',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;
}

export class UpdatedUserWithCommonFields extends IntersectionType(
  UpdateUserDto,
  CommonDto,
) {}

export class UpdateUserResponseDto extends SuccessDto {
  @ApiProperty({
    type: UpdatedUserWithCommonFields,
    description: 'Updated user data',
  })
  data: UpdatedUserWithCommonFields;
}
