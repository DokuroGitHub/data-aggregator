import { HealthStatus, IDetailedHealthResponseDto, IServiceHealthStatus, ISimpleHealthResponseDto } from '@domain/interfaces';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SimpleHealthResponseDto implements ISimpleHealthResponseDto {
  @ApiProperty({
    description: 'Simple health status message',
    example: 'OK',
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'Timestamp of the health check',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional({
    description: 'Application version',
    example: '1.0.0',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Environment',
    example: 'production',
  })
  @IsOptional()
  @IsString()
  environment?: string;
}

export class ServiceHealthStatusDto implements IServiceHealthStatus {
  @ApiProperty({
    description: 'Service name',
    example: 'PostgreSQL',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Service health status',
    example: 'up',
    enum: HealthStatus,
  })
  @IsEnum(HealthStatus)
  status: HealthStatus;

  @ApiPropertyOptional({
    description: 'Status message or error details',
    example: 'Connected successfully',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Response time in milliseconds',
    example: 150,
  })
  @IsOptional()
  responseTime?: number;
}

export class DetailedHealthResponseDto implements IDetailedHealthResponseDto {
  @ApiProperty({
    description: 'Overall health status',
    example: 'up',
    enum: HealthStatus,
  })
  @IsEnum(HealthStatus)
  status: HealthStatus;

  @ApiProperty({
    description: 'Timestamp of the health check',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsString()
  timestamp: string;

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0',
  })
  @IsString()
  version: string;

  @ApiProperty({
    description: 'Environment',
    example: 'production',
  })
  @IsString()
  environment: string;

  @ApiProperty({
    description: 'Individual service health statuses',
    type: [ServiceHealthStatusDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceHealthStatusDto)
  services: ServiceHealthStatusDto[];

  @ApiProperty({
    description: 'Overall system health status',
    example: 'up',
    enum: HealthStatus,
  })
  @IsEnum(HealthStatus)
  overallStatus: HealthStatus;
}
