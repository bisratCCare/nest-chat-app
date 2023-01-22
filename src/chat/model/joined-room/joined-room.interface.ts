import { UserInformation } from 'src/user/model/user.interface';
import { RoomInformation } from '../room/room.interface';
export interface JoinedRoomInformation {
  id?: string;
  socketId: string;
  user: UserInformation;
  room: RoomInformation;
}
