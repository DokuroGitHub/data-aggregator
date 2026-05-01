import { AGGREGATOR_REPOSITORY } from '@common/constants';
import { LOGGING_SERVICE } from '@common/constants';
import { DataHelper } from '@common/helpers';
import { AggregatorEntity } from '@domain/entities';
import { IAggregatorRepository } from '@domain/repositories';
import { IAggregatorExecutionResult, IAggregatorService, ILoggingService } from '@domain/services';
import { ExternalApiClient } from '@infra/external-apis/external-api.client';
import { HttpMethod } from '@infra/external-apis/external-api.client';
import { IRequestOptions } from '@infra/external-apis/external-api.client';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AggregatorService implements IAggregatorService {
  private readonly logger: ReturnType<ILoggingService['createServiceLogger']>;
  static functionCache = new Map();

  constructor(
    @Inject(AGGREGATOR_REPOSITORY)
    private readonly aggregatorRepository: IAggregatorRepository,
    private readonly externalApiClient: ExternalApiClient,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {
    this.logger = this.loggingService.createServiceLogger(AggregatorService.name);
  }

  save(aggregator: AggregatorEntity): Promise<AggregatorEntity> {
    return this.aggregatorRepository.save(aggregator);
  }

  findByName(name: string): Promise<AggregatorEntity | null> {
    return this.aggregatorRepository.findByName(name);
  }

  async executeByName(name: string, params: Record<string, unknown> = {}): Promise<IAggregatorExecutionResult | null> {
    const aggregator = await this.aggregatorRepository.findByName(name);

    if (!aggregator) {
      return null;
    }

    const sourcePromises = aggregator.sources.map((source) => this.executeSource(source, params));
    const sourceResults = await Promise.all(sourcePromises);

    const mergedResults = sourceResults.flatMap((result) => result.items);
    const transformedResults = DataHelper.fn(aggregator.fn, mergedResults);
    const deduplicatedResults = aggregator.shouldRemoveDuplicates
      ? this.removeDuplicates(transformedResults)
      : transformedResults;

    return {
      sources: sourceResults.map(({ name: sourceName, status, error, totalItem }) => ({
        name: sourceName,
        status,
        error,
        totalItem,
      })),
      totalItem: deduplicatedResults.length,
      data: deduplicatedResults,
    } as IAggregatorExecutionResult;
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

  deleteByName(name: string, deletedBy?: string): Promise<boolean> {
    return this.aggregatorRepository.deleteByName(name, deletedBy);
  }

  private async executeSource(
    source: AggregatorEntity['sources'][number],
    params: Record<string, unknown>,
  ): Promise<{
    name: string;
    status: 'success' | 'failed';
    error: string;
    totalItem: number;
    items: unknown[];
  }> {
    try {
      const method = (source.method || 'GET').toUpperCase() as HttpMethod;
      const resolvedUrl = this.resolveTemplate(source.url, params);
      const resolvedBody = this.resolveTemplate<unknown>(source.body, params);
      const resolvedHeaders = this.resolveTemplate<unknown>(source.headers, params);
      const url = this.normalizeRequestUrl(resolvedUrl);
      const body = this.parseObjectLikeString(resolvedBody);
      const headers = this.parseObjectLikeString(resolvedHeaders);
      const options = this.buildRequestOptions(this.isRecord(headers) ? headers : undefined);

      const response = await this.externalApiClient.request(method, url, body, options);

      const transformed = DataHelper.fn(source.fn, response.data);
      const items = Array.isArray(transformed) ? transformed : transformed == null ? [] : [transformed];

      return {
        name: source.name,
        status: 'success',
        error: '',
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
        totalItem: 0,
        items: [],
      };
    }
  }

  private resolveTemplate<T = unknown>(value: T, params: Record<string, unknown>): T {
    if (value == null) {
      return value;
    }

    if (typeof value === 'string') {
      const directMatch = value.match(/^\{\{\s*([\w.-]+)\s*\}\}$/);

      if (directMatch) {
        const directValue = params[directMatch[1]];
        return (directValue ?? value) as T;
      }

      const replaced = value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
        const resolved = params[key];
        return resolved == null ? '' : String(resolved);
      });

      return replaced as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.resolveTemplate(item, params)) as T;
    }

    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        result[key] = this.resolveTemplate(item, params);
      }

      return result as T;
    }

    return value;
  }

  private normalizeRequestUrl(value: unknown): string {
    const raw = typeof value === 'string' ? value.trim() : String(value ?? '').trim();

    if (!raw) {
      return raw;
    }

    if (/^[a-z][a-z\d+.-]*:\/\//i.test(raw)) {
      return raw;
    }

    if (raw.startsWith('//')) {
      return `http:${raw}`;
    }

    return `http://${raw}`;
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

  private parseObjectLikeString<T = unknown>(value: T): T {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    const looksLikeObject = trimmed.startsWith('{') && trimmed.endsWith('}');
    const looksLikeArray = trimmed.startsWith('[') && trimmed.endsWith(']');

    if (!looksLikeObject && !looksLikeArray) {
      return value;
    }

    const parsed = this.tryParseJson(trimmed) ?? this.tryParseJson(this.normalizeJsonLikeString(trimmed));
    return (parsed ?? value) as T;
  }

  private normalizeJsonLikeString(value: string): string {
    return value
      .replace(/([{,]\s*)([A-Za-z0-9_.-]+)\s*:/g, '$1"$2":')
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, content: string) => `"${content.replace(/"/g, '\\"')}"`)
      .replace(/,\s*([}\]])/g, '$1');
  }

  private tryParseJson(value: string): unknown | undefined {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
  }

  private removeDuplicates(items: unknown[]): unknown[] {
    const seen = new Set<string>();

    return items.filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }
}
