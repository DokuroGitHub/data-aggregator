import { ApplicationModule } from '@app/application.module';
import { Module } from '@nestjs/common';
import { AggregatorController } from './controllers/aggregator.controller';
import { HealthController } from './controllers/health.controller';
@Module({
  imports: [ApplicationModule],
  controllers: [AggregatorController, HealthController],
  providers: [],
  exports: [],
})
export class PresentationModule {}
