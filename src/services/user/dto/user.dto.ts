import { ApiProperty } from '@nestjs/swagger';


export class UserDto {
  @ApiProperty({
    example: 'username',
    description: 'Username',
  })
  username: string;

  @ApiProperty({
    example: 'email@example.com',
    description: 'email',
  })
  email: string;

  @ApiProperty({
    example: 'Ryan',
    description: 'first name',
  })
  first_name?: string;

  @ApiProperty({
    example: 'Ghosling',
    description: 'last name',
  })
  last_name?: string;

  @ApiProperty({
    example: '+12345678912',
    description: 'phone number',
  })
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/123',
    description: 'avatar',
  })
  avatar?: string;
}
