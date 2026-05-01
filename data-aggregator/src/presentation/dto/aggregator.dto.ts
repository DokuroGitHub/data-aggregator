import { AggregatorStatus } from '@common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class AggregatorSourceDto {
  @ApiPropertyOptional({ example: 'Sales System' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'GET' })
  @IsString()
  method: string;

  @ApiProperty({ example: 'http://localhost:8001/api/sales-system/search?q={{vin}}&pageSize=5&mimeType=pdf' })
  @IsString()
  url: string;

  @ApiPropertyOptional({
    description: 'Request headers template used to call source endpoint',
    type: Object,
    nullable: true,
  })
  @IsOptional()
  headers?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Request body template used to call source endpoint',
    type: Object,
    nullable: true,
  })
  @IsOptional()
  body?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Transform function expression for source response',
    example: "return value?.data?.map(x=>({url: x.url, mimeType: x.mimeType, source: 'Sales System'})) ?? [];",
  })
  @IsOptional()
  @IsString()
  fn?: string;
}

export class SaveAggregatorDto {
  @ApiProperty({ example: 'unified-document-view-by-vin' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Unified Document View By Vehicle Identification Number (VIN)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: AggregatorStatus;

  @ApiProperty({ type: [String], example: ['vin', 'X-API-KEY'] })
  @IsArray()
  @IsString({ each: true })
  params: string[];

  @ApiProperty({ type: [AggregatorSourceDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AggregatorSourceDto)
  sources: AggregatorSourceDto[];

  @ApiPropertyOptional({
    description: 'Final merge function expression after collecting all source records',
    example: 'return value.slice(0, 10);',
  })
  @IsOptional()
  @IsString()
  fn?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  shouldRemoveDuplicates?: boolean;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class AggregatorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'unified-document-view-by-vin' })
  name: string;

  @ApiPropertyOptional({ example: 'Unified Document View By Vehicle Identification Number (VIN)' })
  description?: string;

  @ApiProperty({ enum: ['active', 'inactive'] })
  status: AggregatorStatus;

  @ApiProperty({ type: [String] })
  params: string[];

  @ApiProperty({ type: [AggregatorSourceDto] })
  sources: AggregatorSourceDto[];

  @ApiPropertyOptional()
  fn?: string;

  @ApiProperty()
  shouldRemoveDuplicates: boolean;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedBy?: string;

  @ApiProperty()
  updatedAt: Date;
}
