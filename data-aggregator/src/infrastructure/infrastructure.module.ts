import {
  AGGREGATOR_REPOSITORY,
} from '@common/constants';
import { HttpModule } from '@nestjs/axios';
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AggregatorOrmEntity,
  AggregatorRepository,
  DatabaseModule,
} from './database';
import { ExternalApisModule } from './external-apis';
import { LoggingModule } from './logging';

const PROVIDERS: Provider[] = [
  {
    provide: AGGREGATOR_REPOSITORY,
    useClass: AggregatorRepository,
  }
];

@Module({
  imports: [
    TypeOrmModule.forFeature([AggregatorOrmEntity]),
    DatabaseModule,
    LoggingModule,
    HttpModule,
    ExternalApisModule,
  ],
  providers: PROVIDERS,
  exports: [ExternalApisModule, ...PROVIDERS],
})
export class InfrastructureModule {}
