import { UserInformation } from 'src/user/model/user.interface';

export interface ConnectedUserInformation {
  id?: string;
  socketId: string;
  user: UserInformation;
}
