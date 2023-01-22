import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUserEntity } from '../../model/connected-user/connected-user.entity';
import { Repository } from 'typeorm';
import { ConnectedUserInformation } from '../../model/connected-user/connected-user.interface';
import { UserInformation } from 'src/user/model/user.interface';

@Injectable()
export class ConnectedUserService {
  constructor(
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepository: Repository<ConnectedUserEntity>,
  ) {}

  async create(
    connectedUser: ConnectedUserInformation,
  ): Promise<ConnectedUserInformation> {
    return this.connectedUserRepository.save(connectedUser);
  }
  async findByUser(user: UserInformation): Promise<ConnectedUserInformation[]> {
    return this.connectedUserRepository.findBy({ user });
  }
  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }
  async deleteAll() {
    await this.connectedUserRepository.createQueryBuilder().delete().execute();
  }
}
