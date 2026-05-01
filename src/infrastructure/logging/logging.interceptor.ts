import { CONFIG_NAMES, LOGGING_SERVICE } from '@common/constants';
import { IAppConfiguration } from '@domain/interfaces';
import { ILoggingService } from '@domain/services';
import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Utility function to extract correlation ID
function extractCorrelationId(request: Request): string {
  return (
    request.get('X-Correlation-ID') ||
    request.get('x-correlation-id') ||
    (request as any).correlationId ||
    `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private appConfig: IAppConfiguration;

  constructor(
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,

    private readonly configService: ConfigService,
  ) {
    this.appConfig = this.configService.get<IAppConfiguration>(CONFIG_NAMES.APPLICATION);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const correlationId = extractCorrelationId(request);

    // Add correlation ID to request for downstream use
    (request as any).correlationId = correlationId;

    // Skip setting headers for SSE endpoints to avoid conflicts
    if (!this.isSSEEndpoint(request)) {
      // Add correlation ID to response headers
      response.setHeader('X-Correlation-ID', correlationId);
    }

    const startTime = Date.now();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';

    // Skip logging for ignored URLs
    if (this.shouldSkipLogging(url)) {
      return next.handle();
    }

    // Log incoming request
    this.logRequest(method, url, ip, userAgent, correlationId);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logResponse(method, url, response.statusCode, duration, correlationId, data);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logError(method, url, error, duration, correlationId);
        throw error;
      }),
    );
  }

  private isSSEEndpoint(request: Request): boolean {
    return (
      request.url.includes('/stream') ||
      request.url.includes('/events') ||
      request.get('Accept')?.includes('text/event-stream') ||
      request.get('Cache-Control') === 'no-cache'
    );
  }

  private shouldSkipLogging(url: string): boolean {
    const ignoredPaths = ['/health', '/metrics', '/favicon.ico'];
    return ignoredPaths.some((path) => url.includes(path));
  }

  private logRequest(method: string, url: string, ip: string, userAgent: string, correlationId: string): void {
    if (!this.appConfig?.enableRequestResponseLogging) {
      return;
    }

    this.loggingService.logRequest(method, url, {
      correlationId,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId: string,
    responseData?: any,
  ): void {
    if (!this.appConfig?.enableRequestResponseLogging) {
      return;
    }

    const context = {
      correlationId,
      timestamp: new Date().toISOString(),
    };

    // Add response data in non-production (be careful with sensitive data)
    if (this.appConfig?.nodeEnv !== 'production' && responseData) {
      context['responseSize'] = JSON.stringify(responseData).length;
    }

    this.loggingService.logResponse(method, url, statusCode, `${duration}ms`, context);
  }

  private logError(method: string, url: string, error: any, duration: number, correlationId: string): void {
    // Create safe error object to avoid circular references
    const safeError = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      status: error?.status,
      code: error?.code,
    };

    this.loggingService.logError(method, url, safeError, `${duration}ms`, {
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Decorator to add correlation ID tracking to methods
 */
export function WithCorrelationId(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    // Try to extract correlation ID from various sources
    let correlationId: string | undefined;

    // Check if first argument has correlationId (common pattern)
    if (args && typeof args === 'object' && args[0].correlationId) {
      correlationId = args[0].correlationId;
    }

    // Check if any argument is a request object
    const requestArg = args.find((arg) => arg && typeof arg === 'object' && arg.headers && arg.method);
    if (requestArg && !correlationId) {
      correlationId = extractCorrelationId(requestArg);
    }

    // Add correlation ID to method context
    if (correlationId) {
      const logger = new Logger(target.constructor.name);
      logger.log(`Executing ${propertyName} with correlation ID: ${correlationId}`);
    }

    return method.apply(this, args);
  };
}
