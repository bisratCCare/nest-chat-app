import { ApiProperty } from '@nestjs/swagger';
import { UserInformation } from 'src/user/model/user.interface';

export class RoomInformation {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  name?: string;
  @ApiProperty()
  description?: string;
  @ApiProperty()
  users?: UserInformation[];
  @ApiProperty()
  created_at?: Date;
  @ApiProperty()
  updated_at?: Date;
}
