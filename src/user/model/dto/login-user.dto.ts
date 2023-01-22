import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is weak',
  })
  password: string;
}
