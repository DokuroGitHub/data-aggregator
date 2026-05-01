import { MONITORING_SERVICE } from '@common/constants';
import { Global, Module } from '@nestjs/common';
import { ApmService } from './apm.service';

@Global()
@Module({
  providers: [
    {
      provide: MONITORING_SERVICE,
      useClass: ApmService,
    },
  ],
  exports: [MONITORING_SERVICE],
})
export class ApmModule {}
