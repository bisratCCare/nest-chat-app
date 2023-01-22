import { JoinedRoomEntity } from './../../model/joined-room/joined-room.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinedRoomInformation } from '../../model/joined-room/joined-room.interface';
import { UserInformation } from 'src/user/model/user.interface';
import { RoomInformation } from '../../model/room/room.interface';

@Injectable()
export class JoinedRoomService {
  constructor(
    @InjectRepository(JoinedRoomEntity)
    private readonly joinedRoomRepository: Repository<JoinedRoomEntity>,
  ) {}

  async create(
    joinedRoom: JoinedRoomInformation,
  ): Promise<JoinedRoomInformation> {
    return this.joinedRoomRepository.save(joinedRoom);
  }
  async findByUser(user: UserInformation): Promise<JoinedRoomInformation[]> {
    return this.joinedRoomRepository.findBy({ user });
  }
  async findByRoom(room: RoomInformation): Promise<JoinedRoomInformation[]> {
    return this.joinedRoomRepository.findBy({ room });
  }
  async deleteBySocketId(socketId: string) {
    return this.joinedRoomRepository.delete({ socketId });
  }
  async deleteAll() {
    await this.joinedRoomRepository.createQueryBuilder().delete().execute();
  }
}
