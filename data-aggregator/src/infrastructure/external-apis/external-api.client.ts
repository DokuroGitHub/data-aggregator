import { LOGGING_SERVICE } from '@common/constants';
import { ILoggingService } from '@domain/services';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface IExternalApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IRequestOptions extends Partial<AxiosRequestConfig> {
  retries?: number;
  retryDelay?: number;
}

@Injectable()
export class ExternalApiClient {
  protected readonly logger: ReturnType<ILoggingService['createServiceLogger']>;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly configService: ConfigService,

    @Inject(LOGGING_SERVICE)
    protected readonly loggingService: ILoggingService,
  ) {
    this.logger = this.loggingService.createServiceLogger(ExternalApiClient.name);
  }

  async request(
    method: HttpMethod,
    url: string,
    data?: unknown,
    options?: IRequestOptions,
  ): Promise<{
    statusText: string;
    responseTime: string;
    error?: unknown;
    data: unknown;
  }> {
    const config: AxiosRequestConfig = {
      timeout: options?.timeout,
      params: {
        ...options?.params,
      },
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    // this.logger.info(`[${method}] Making request to: ${url}`);

    let response: AxiosResponse;
    const startTime = Date.now();

    try {
      switch (method) {
        case 'GET':
          response = await firstValueFrom(this.httpService.get(url, config));
          break;
        case 'POST':
          response = await firstValueFrom(this.httpService.post(url, data, config));
          break;
        case 'PUT':
          response = await firstValueFrom(this.httpService.put(url, data, config));
          break;
        case 'DELETE':
          response = await firstValueFrom(this.httpService.delete(url, config));
          break;
        case 'PATCH':
          response = await firstValueFrom(this.httpService.patch(url, data, config));
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      const duration = Date.now() - startTime;

      this.logger.info(`[${method}] Request successful: ${url} - ${duration}ms`);
      return {
        statusText: response.statusText,
        responseTime: `${duration}ms`,
        error: null,
        data: response.data,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorContext = {
        method,
        url,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        responseTime: `${duration}ms`,
      };

      this.logger.error(`[${method}] Request failed: ${url}`, errorContext);
      return {
        statusText: 'Error',
        responseTime: `${duration}ms`,
        error: error,
        data: null,
      };
    }
  }
}
