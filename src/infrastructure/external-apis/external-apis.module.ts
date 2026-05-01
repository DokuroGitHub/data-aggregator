import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging';
import { ExternalApiClient } from './external-api.client';

const PROVIDERS = [ExternalApiClient];

@Module({
  imports: [HttpModule, LoggingModule],
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class ExternalApisModule {}
