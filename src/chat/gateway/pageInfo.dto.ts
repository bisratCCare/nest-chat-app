import { ApiProperty } from '@nestjs/swagger';

export class PageInfo {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
