import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserHelperService } from '../service/user-helper';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserInformation } from '../model/user.interface';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseInfo } from '../../user/model/login-response.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common/enums';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create User' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserInformation> {
    const user: UserInformation =
      this.userHelperService.createUserDtoToEntity(createUserDto);
    return this.userService.createUser(user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetchs Users' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<UserInformation>> {
    limit = limit > 50 ? 50 : limit;
    return this.userService.findAll({
      page,
      limit,
      route: 'http://localhost:3000/api/users',
    });
  }

  @Get('/username')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetches User by username' })
  async findAllByUsername(@Query('username') username: string) {
    return this.userService.findAllByUsername(username);
  }

  @Post('login')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User Login' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseInfo> {
    const user: UserInformation =
      this.userHelperService.loginUserDtoToEntity(loginUserDto);
    const jwt: string = await this.userService.login(user);
    return {
      accessToken: jwt,
      tokenType: 'JWT',
      expiresIn: 3600,
    };
  }
}
