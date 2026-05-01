import { CONFIG_NAMES } from '@common/constants';
import { IPostgresConfiguration } from '@domain/interfaces';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatorOrmEntity } from './typeorm/entities/aggregator.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const postgresConfig = configService.getOrThrow<IPostgresConfiguration>(CONFIG_NAMES.POSTGRES);

        return {
          type: 'postgres',
          host: postgresConfig.host,
          port: postgresConfig.port,
          username: postgresConfig.username,
          password: postgresConfig.password,
          database: postgresConfig.database,
          entities: [AggregatorOrmEntity],
          synchronize: postgresConfig.synchronize,
          logging: postgresConfig.logging,
          maxQueryExecutionTime: postgresConfig.maxQueryExecutionTime,
          extra: {
            options: `-c search_path=${postgresConfig.schema}`,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
