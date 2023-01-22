import { AuthService } from './../auth/service/auth.service';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { NestMiddleware } from '@nestjs/common/interfaces/middleware/nest-middleware.interface';
import { NextFunction } from 'express';
import { UserInformation } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';

export interface RequestModel extends Request {
  user: UserInformation;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  async use(req: RequestModel, res: Response, next: NextFunction) {
    try {
      const token: string[] = req.headers['authorization'].split(' ');
      const decodedToken = await this.authService.verifyJwt(token[1]);

      // check user
      const user: UserInformation = await this.userService.getOne(
        decodedToken.user.id,
      );
      if (user) {
        req.user = user;
        next();
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } catch {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
