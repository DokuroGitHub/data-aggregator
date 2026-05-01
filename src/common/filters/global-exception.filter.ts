import { IAppConfiguration } from '@domain/interfaces';
import { ILoggingService, IMonitoringService } from '@domain/services';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CONFIG_NAMES } from '../constants';
import { LOGGING_SERVICE, MONITORING_SERVICE } from '../constants/di-tokens';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  correlationId?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly appConfig: IAppConfiguration;

  constructor(
    private readonly configService: ConfigService,
    @Inject(MONITORING_SERVICE)
    private readonly monitoringService: IMonitoringService,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {
    this.appConfig = this.configService.get<IAppConfiguration>(CONFIG_NAMES.APPLICATION);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Skip SSE endpoints to avoid header conflicts
    if (this.isSSEEndpoint(request)) {
      this.logger.warn(`SSE endpoint error: ${request.url} - ${exception}`);
      return;
    }

    const correlationId = this.generateCorrelationId();
    const errorInfo = this.extractErrorInfo(exception);

    // Capture error in APM
    if (exception instanceof Error) {
      this.monitoringService.captureError(exception, {
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
        correlationId,
        statusCode: errorInfo.statusCode,
      });
    }

    // Log error with centralized logging
    this.logError(exception, request, correlationId, errorInfo);

    // Prepare response
    const errorResponse = this.buildErrorResponse(errorInfo, request, correlationId);

    // Send response only if headers haven't been sent
    if (!response.headersSent) {
      response.status(errorInfo.statusCode).json(errorResponse);
    }
  }

  private extractErrorInfo(exception: unknown): {
    statusCode: number;
    message: string;
    error?: string;
    details?: any;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return {
        statusCode: exception.getStatus(),
        message: typeof response === 'string' ? response : (response as any).message,
        error: exception.name,
        details: typeof response === 'object' ? response : undefined,
      };
    }

    // Handle specific error types
    if (exception instanceof Error) {
      // MongoDB errors
      if (exception.name === 'MongoError' || exception.name === 'MongooseError') {
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database service temporarily unavailable',
          error: 'DatabaseError',
          details: this.isProduction() ? undefined : exception.message,
        };
      }

      // Redis errors
      if (exception.message.includes('Redis') || exception.message.includes('ECONNREFUSED')) {
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Cache service temporarily unavailable',
          error: 'CacheError',
          details: this.isProduction() ? undefined : exception.message,
        };
      }

      // Bot Framework errors
      if (exception.message.includes('Bot') || exception.message.includes('Activity')) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid bot request',
          error: 'BotFrameworkError',
          details: this.isProduction() ? undefined : exception.message,
        };
      }

      // Generic application errors
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.isProduction() ? 'Internal server error' : exception.message,
        error: exception.name,
        details: this.isProduction() ? undefined : exception.stack,
      };
    }

    // Unknown errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'UnknownError',
      details: this.isProduction() ? undefined : String(exception),
    };
  }

  private logError(exception: unknown, request: Request, correlationId: string, errorInfo: any): void {
    const logContext = {
      correlationId,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      statusCode: errorInfo.statusCode,
      error: errorInfo.error,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
      details: errorInfo.details,
    };

    // Use centralized logging service
    const message = `${errorInfo.error}: ${errorInfo.message}`;

    if (errorInfo.statusCode >= 500) {
      this.loggingService.error(message, logContext);
    } else if (errorInfo.statusCode >= 400) {
      this.loggingService.warn(message, logContext);
    } else {
      this.loggingService.info(message, logContext);
    }
  }

  private buildErrorResponse(errorInfo: any, request: Request, correlationId: string): ErrorResponse {
    const baseResponse: ErrorResponse = {
      statusCode: errorInfo.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorInfo.message,
      correlationId,
    };

    // Add additional info in non-production
    if (!this.isProduction()) {
      baseResponse.error = errorInfo.error;
      baseResponse.details = errorInfo.details;
    }

    return baseResponse;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private isProduction(): boolean {
    return this.appConfig?.nodeEnv === 'production';
  }

  private isSSEEndpoint(request: Request): boolean {
    const sseHeaders = request.get('Accept')?.includes('text/event-stream');
    const sseUrl = request.url.includes('/streaming/');
    return sseHeaders || sseUrl;
  }
}
