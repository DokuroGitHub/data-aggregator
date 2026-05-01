import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;
  @ApiProperty({ example: '2024-06-01T12:34:56.789Z' })
  timestamp: string;
  @ApiProperty({ example: '/aggregators' })
  path: string;
  @ApiProperty({ example: 'GET' })
  method: string;
  @ApiProperty({ example: 'Provided \"skip\" value is not a number. Please provide a numeric value.' })
  message: string;
  @ApiProperty({ example: 'TypeORMError' })
  error?: string;
  @ApiProperty({ example: '1777609547686-a9jqyy11y' })
  correlationId?: string;
  @ApiProperty({ example: 'TypeORMError: Provided \"skip\" value is not a number.' })
  details?: any;
}
