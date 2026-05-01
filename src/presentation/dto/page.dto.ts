import { ApiProperty } from '@nestjs/swagger';

export class PageResponseDto<T = unknown> {
  @ApiProperty({ example: '' })
  error: string;

  @ApiProperty({ example: 1 })
  pageNumber: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 2 })
  totalPage: number;

  @ApiProperty({ example: 25 })
  totalItem: number;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ isArray: true, type: Object })
  data: T[];
}
