import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserHelperService } from './service/user-helper';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UserController],
  providers: [UserService, UserHelperService],
  exports: [UserService],
})
export class UserModule {}
