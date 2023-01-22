import { RoomInformation } from '../room/room.interface';
import { UserInformation } from './../../../user/model/user.interface';

export interface MessageInformation {
  id?: string;
  text: string;
  user: UserInformation;
  room: RoomInformation;
  created_at: Date;
  updated_at: Date;
}
