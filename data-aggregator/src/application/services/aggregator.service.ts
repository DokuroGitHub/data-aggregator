import { AGGREGATOR_REPOSITORY, CONFIG_NAMES } from '@common/constants';
import { LOGGING_SERVICE } from '@common/constants';
import { DataHelper } from '@common/helpers';
import { AggregatorEntity } from '@domain/entities';
import { IRedisConfiguration } from '@domain/interfaces';
import { IAggregatorRepository } from '@domain/repositories';
import { IAggregatorExecutionResult, IAggregatorService, ILoggingService } from '@domain/services';
import { ExternalApiClient } from '@infra/external-apis/external-api.client';
import { HttpMethod } from '@infra/external-apis/external-api.client';
import { IRequestOptions } from '@infra/external-apis/external-api.client';
import { RedisClient } from '@infra/redis';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AggregatorService implements IAggregatorService {
  private readonly logger: ReturnType<ILoggingService['createServiceLogger']>;
  private redisConfig: IRedisConfiguration;

  constructor(
    @Inject(AGGREGATOR_REPOSITORY)
    private readonly aggregatorRepository: IAggregatorRepository,
    private readonly externalApiClient: ExternalApiClient,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
    private readonly redisClient: RedisClient,
    private readonly configService: ConfigService,
  ) {
    this.logger = this.loggingService.createServiceLogger(AggregatorService.name);
    this.redisConfig = this.configService.get<IRedisConfiguration>(CONFIG_NAMES.REDIS);
  }

  async save(aggregator: AggregatorEntity): Promise<AggregatorEntity> {
    const cacheKey = `${this.redisConfig.aggregatorPrefix}:${aggregator.name}`;

    // Invalidate cache before saving
    await this.redisClient.delete(cacheKey);

    return this.aggregatorRepository.save(aggregator);
  }

  async findByName(name: string): Promise<AggregatorEntity | null> {
    const cacheKey = `${this.redisConfig.aggregatorPrefix}:${name}`;

    // Try to get from Redis first
    const cachedData = await this.redisClient.get<AggregatorEntity>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from repository
    const aggregator = await this.aggregatorRepository.findByName(name);

    // Cache the result if found
    if (aggregator) {
      await this.redisClient.set(cacheKey, aggregator, this.redisConfig.aggregatorTTL);
    }

    return aggregator;
  }

  async executeByName(name: string, params: Record<string, unknown> = {}): Promise<IAggregatorExecutionResult | null> {
    const cacheKey = `${this.redisConfig.aggregatorResponsePrefix}:${name}:${JSON.stringify(params)}`;

    // Try to get from Redis first
    const cachedData = await this.redisClient.get<IAggregatorExecutionResult>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const aggregator = await this.findByName(name);

    if (!aggregator) {
      return null;
    }

    const sourcePromises = aggregator.sources.map((source) => this.executeSource(source, params));
    const sourceResults = await Promise.all(sourcePromises);

    const mergedResults = sourceResults.flatMap((result) => result.items);
    const transformedResults = DataHelper.fn(aggregator.fn, mergedResults);
    const deduplicatedResults = aggregator.shouldRemoveDuplicates
      ? DataHelper.removeDuplicates(transformedResults)
      : transformedResults;

    const result: IAggregatorExecutionResult = {
      sources: sourceResults.map(({ name: sourceName, status, error, responseTime, totalTime, totalItem }) => ({
        name: sourceName,
        status,
        error,
        responseTime,
        totalTime,
        totalItem,
      })),
      totalItem: deduplicatedResults.length,
      data: deduplicatedResults,
    };

    // Cache the result
    if (aggregator) {
      await this.redisClient.set(cacheKey, result, this.redisConfig.aggregatorResponseTTL);
    }

    return result;
  }

  findAll(includeInactive?: boolean): Promise<AggregatorEntity[]> {
    return this.aggregatorRepository.findAll(includeInactive);
  }

  getPage(
    status: string | null = null,
    createdBy: string | null = null,
    pageNumber: number = 1,
    pageSize: number = 10,
  ) {
    return this.aggregatorRepository.getPage(status, createdBy, pageNumber, pageSize);
  }

  async deleteByName(name: string, deletedBy?: string): Promise<boolean> {
    const cacheKey = `${this.redisConfig.aggregatorPrefix}:${name}`;

    // Invalidate cache before deleting
    await this.redisClient.delete(cacheKey);

    return this.aggregatorRepository.deleteByName(name, deletedBy);
  }

  private async executeSource(
    source: AggregatorEntity['sources'][number],
    params: Record<string, unknown>,
  ): Promise<{
    name: string;
    status: 'success' | 'failed';
    error: string;
    responseTime: string;
    totalTime: string;
    totalItem: number;
    items: unknown[];
  }> {
    const startTime = Date.now();
    let responseTime = '';
    try {
      const method = (source.method || 'GET').toUpperCase() as HttpMethod;
      const resolvedUrl = DataHelper.resolveTemplate(source.url, params);
      const resolvedBody = DataHelper.resolveTemplate<unknown>(source.body, params);
      const resolvedHeaders = DataHelper.resolveTemplate<unknown>(source.headers, params);
      const url = DataHelper.normalizeRequestUrl(resolvedUrl);
      const body = DataHelper.parseObjectLikeString(resolvedBody);
      const headers = DataHelper.parseObjectLikeString(resolvedHeaders);
      const options = this.buildRequestOptions(DataHelper.isRecord(headers) ? headers : undefined);

      const response = await this.externalApiClient.request(method, url, body, options);
      responseTime = response.responseTime;
      if (response.error) {
        throw response.error;
      }

      const transformed = DataHelper.fn(source.fn, response.data);
      const items = Array.isArray(transformed) ? transformed : transformed == null ? [] : [transformed];

      return {
        name: source.name,
        status: 'success',
        error: '',
        responseTime: responseTime,
        totalTime: `${Date.now() - startTime}ms`,
        totalItem: items.length,
        items,
      };
    } catch (error) {
      this.logger.error(`Error executing source ${source.url}: `, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });

      return {
        name: source.name,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        responseTime: responseTime,
        totalTime: `${Date.now() - startTime}ms`,
        totalItem: 0,
        items: [],
      };
    }
  }

  private buildRequestOptions(headers?: Record<string, unknown>): IRequestOptions | undefined {
    if (!headers) {
      return undefined;
    }

    const normalizedHeaders = Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value == null) {
        return acc;
      }

      acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return acc;
    }, {});

    return { headers: normalizedHeaders };
  }
}
