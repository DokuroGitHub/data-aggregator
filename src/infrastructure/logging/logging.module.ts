import { LOGGING_SERVICE } from '@common/constants';
import { Global, Module } from '@nestjs/common';
import { ApmModule } from '../apm/apm.module';
import { LoggingService } from './logging.service';

@Global()
@Module({
  imports: [ApmModule],
  providers: [
    {
      provide: LOGGING_SERVICE,
      useClass: LoggingService,
    },
  ],
  exports: [LOGGING_SERVICE],
})
export class LoggingModule {}
