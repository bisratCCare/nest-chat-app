import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../model/user.entity';
import { UserInformation } from '../model/user.interface';
import { AuthService } from '../../auth/service/auth.service';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async createUser(newUser: UserInformation): Promise<UserInformation> {
    try {
      const exists: boolean = await this.userExists(
        newUser.username,
        newUser.email,
      );
      if (!exists) {
        const passwordHash: string = await this.hashPassword(newUser.password);
        newUser.password = passwordHash;
        const user = await this.userRepository.save(
          this.userRepository.create(newUser),
        );
        return this.findOne(user.id);
      } else {
        throw new HttpException(
          'Email or Username is already in use',
          HttpStatus.CONFLICT,
        );
      }
    } catch {
      throw new HttpException(
        'Email or Username is already in use',
        HttpStatus.CONFLICT,
      );
    }
  }

  async login(user: UserInformation): Promise<string> {
    try {
      const found: UserInformation = await this.findByUsername(
        user.username.toLowerCase(),
      );
      if (found) {
        const match: boolean = await this.validatePassword(
          user.password,
          found.password,
        );
        if (match) {
          const payload: UserInformation = await this.findOne(found.id);
          return this.authService.generateJwt(payload);
        } else {
          throw new HttpException(
            'Login failed, wrong credentials',
            HttpStatus.UNAUTHORIZED,
          );
        }
      } else {
        throw new HttpException(
          'Login failed, wrong credentials',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch {
      throw new HttpException(
        'Login failed, wrong credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<UserInformation>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  async findAllByUsername(username: string): Promise<UserInformation[]> {
    return this.userRepository.find({
      where: {
        username: Like(`%${username.toLowerCase()}%`),
      },
    });
  }

  // custom handlers
  // returns the password
  private async findByUsername(username: string): Promise<UserInformation> {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'email', 'username', 'password'],
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return this.authService.hashPassword(password);
  }

  private async validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<any> {
    return this.authService.comparePasswords(password, storedPasswordHash);
  }

  private async findOne(id: string): Promise<UserInformation> {
    return this.userRepository.findOneBy({ id });
  }

  public getOne(id: string): Promise<UserInformation> {
    return this.userRepository.findOneByOrFail({ id });
  }

  private async userExists(username: string, email: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ username, email });
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
