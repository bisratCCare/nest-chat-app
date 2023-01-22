import { UserInformation } from 'src/user/model/user.interface';

export interface RoomInformation {
  id?: string;
  name?: string;
  description?: string;
  users?: UserInformation[];
  created_at?: Date;
  updated_at?: Date;
}
