import { ApiProperty } from '@nestjs/swagger';
import { RoomInformation } from '../model/room/room.dto';
import { UserInformation } from './../../user/model/user.interface';

export class MessageInfo {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  text: string;
  @ApiProperty()
  user: UserInformation;
  @ApiProperty()
  room: RoomInformation;
  @ApiProperty()
  created_at: Date;
  @ApiProperty()
  updated_at: Date;
}
