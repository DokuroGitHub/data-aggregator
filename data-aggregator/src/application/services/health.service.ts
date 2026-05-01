import { ISimpleHealthResponseDto } from '@domain/interfaces';
import { IHealthService } from '@domain/services';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService implements IHealthService {
  async getHealth(): Promise<ISimpleHealthResponseDto> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
