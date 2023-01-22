import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserInformation } from '../model/user.interface';
import { LoginUserDto } from '../model/dto/login-user.dto';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): UserInformation {
    return {
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password,
    };
  }
  loginUserDtoToEntity(loginUserDto: LoginUserDto): UserInformation {
    return {
      username: loginUserDto.username,
      password: loginUserDto.password,
    };
  }
}
