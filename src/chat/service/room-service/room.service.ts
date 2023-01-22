import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from '../../model/room/room.entity';
import { RoomInformation } from '../../model/room/room.interface';
import { UserInformation } from 'src/user/model/user.interface';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) {}
  async createRoom(
    room: RoomInformation,
    creator: UserInformation,
  ): Promise<RoomInformation> {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }
  async getRoom(roomId: string): Promise<RoomInformation> {
    return this.roomRepository.findOne({
      where: {
        id: roomId,
      },
      relations: ['users'],
    });
  }
  async getRoomsForUser(
    userId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<RoomInformation>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updated_at', 'DESC');
    return paginate(query, options);
  }

  async addCreatorToRoom(
    room: RoomInformation,
    creator: UserInformation,
  ): Promise<RoomInformation> {
    room.users.push(creator);
    return room;
  }
}
