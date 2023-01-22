import { MessageInformation } from './../../model/message/message.interface';
import { Injectable } from '@nestjs/common/decorators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomInformation } from '../../model/room/room.interface';
import { MessageEntity } from 'src/chat/model/message/message.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async create(message: MessageInformation): Promise<MessageInformation> {
    return this.messageRepository.save(this.messageRepository.create(message));
  }
  async findMessagesForRoom(
    room: RoomInformation,
    options: IPaginationOptions,
  ): Promise<Pagination<MessageInformation>> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.room', 'room')
      .where('room.id = :roomId', { roomId: room.id })
      .leftJoinAndSelect('message.user', 'user')
      .orderBy('message.created_at', 'DESC');
    return paginate(query, options);
  }
}
