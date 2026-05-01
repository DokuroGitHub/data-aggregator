import { AGGREGATOR_SERVICE, HEALTH_SERVICE, JWT_SERVICE } from '@common/constants';
import { InfrastructureModule } from '@infra/infrastructure.module';
import { Module } from '@nestjs/common';
import { AggregatorService } from './services/aggregator.service';
import { JwtService } from './services/jwt.service';
import { HealthService } from './services/health.service';

const providers = [
  {
    provide: AGGREGATOR_SERVICE,
    useClass: AggregatorService,
  },
  {
    provide: JWT_SERVICE,
    useClass: JwtService,
  },
  {
    provide: HEALTH_SERVICE,
    useClass: HealthService,
  },
];
@Module({
  imports: [InfrastructureModule],
  providers: providers,
  exports: providers,
})
export class ApplicationModule {}
