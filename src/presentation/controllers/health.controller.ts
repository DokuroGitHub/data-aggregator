import { IHealthService } from '@domain/services';
import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SimpleHealthResponseDto } from '../dto';
import { HEALTH_SERVICE } from '@common/constants';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_SERVICE)
    private readonly healthService: IHealthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Application Health Check',
    description:
      'Basic health check endpoint that returns application status, version, and timestamp. Used by load balancers and monitoring systems.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is healthy and running',
    type: SimpleHealthResponseDto,
  })
  async getHealth(): Promise<SimpleHealthResponseDto> {
    const health = await this.healthService.getHealth();
    return {
      status: health.status.toUpperCase(),
      timestamp: health.timestamp,
      version: health.version,
      environment: health.environment,
    };
  }
}
