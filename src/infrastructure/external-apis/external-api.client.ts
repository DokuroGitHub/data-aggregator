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
  private static readonly SERVICE_NAME = 'ExternalApiClient';

  constructor(
    protected readonly httpService: HttpService,
    protected readonly configService: ConfigService,

    @Inject(LOGGING_SERVICE)
    protected readonly loggingService: ILoggingService,
  ) {
    this.logger = this.loggingService.createServiceLogger(ExternalApiClient.SERVICE_NAME);
  }

  async request(method: HttpMethod, url: string, data?: unknown, options?: IRequestOptions) {
    const startTime = Date.now();
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

      this.logger.info(`[${method}] Request successful: ${url} - ${Date.now() - startTime}ms`);
      return {
        statusText: response.statusText,
        data: response.data,
      };
    } catch (error) {
      const errorContext = {
        method,
        url,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        duration: `${Date.now() - startTime}ms`,
      };

      this.logger.error(`[${method}] Request failed: ${url}`, errorContext);
      throw error;
    }
  }
}
