import { LOGGING_SERVICE, REDIS_CLIENT } from '@common/constants';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ILoggingService } from '@domain/services';

@Injectable()
export class RedisClient {
  private readonly logger: ReturnType<ILoggingService['createServiceLogger']>;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {
    this.logger = this.loggingService.createServiceLogger(RedisClient.name);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (data) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      this.logger.warn(`Redis get failed for key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await this.redis.set(key, JSON.stringify(value));
      }
      this.logger.debug(`Cached key: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`);
    } catch (error) {
      this.logger.warn(`Redis set failed for key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      this.logger.warn(`Redis delete failed for key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Deleted cache keys: ${keys.join(', ')}`);
      }
    } catch (error) {
      this.logger.warn(`Redis deleteMany failed for keys: ${keys.join(', ')}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.warn(`Redis exists check failed for key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const result = await this.redis.incrby(key, amount);
      return result;
    } catch (error) {
      this.logger.warn(`Redis increment failed for key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error(`Redis ping failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
