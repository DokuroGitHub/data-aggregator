import { CONFIG_NAMES, REDIS_CLIENT } from '@common/constants';
import { IRedisConfiguration } from '@domain/interfaces';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisClient } from './redis.client';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.getOrThrow<IRedisConfiguration>(CONFIG_NAMES.REDIS);

        return new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
        });
      },
      inject: [ConfigService],
    },
    RedisClient,
  ],
  exports: [REDIS_CLIENT, RedisClient],
})
export class RedisModule {}
