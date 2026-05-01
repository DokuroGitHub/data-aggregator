import { CONFIG_NAMES, MONITORING_SERVICE } from '@common/constants';
import {
  IAppConfiguration,
  IElasticApmConfiguration,
  IEsLogConfiguration,
  ILoggingConfiguration,
} from '@domain/interfaces';
import { ILoggingService, IMonitoringService, LogContext } from '@domain/services';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format as utilFormat } from 'util';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

@Injectable()
export class LoggingService implements ILoggingService, OnModuleInit {
  private readonly nestLogger = new Logger(LoggingService.name);
  private winstonLogger: winston.Logger;
  private appConfig: IAppConfiguration;
  private esLogConfig: IEsLogConfiguration;
  private loggingConfig: ILoggingConfiguration;
  private elasticApmConfig: IElasticApmConfiguration;

  constructor(
    @Inject(MONITORING_SERVICE)
    private readonly monitoringService: IMonitoringService,

    private readonly configService: ConfigService,
  ) {
    this.appConfig = this.configService.get<IAppConfiguration>(CONFIG_NAMES.APPLICATION);
    this.esLogConfig = this.configService.get<IEsLogConfiguration>(CONFIG_NAMES.ES_LOG);
    this.loggingConfig = this.configService.get<ILoggingConfiguration>(CONFIG_NAMES.LOGGING);
    this.elasticApmConfig = this.configService.get<IElasticApmConfiguration>(CONFIG_NAMES.ELASTIC_APM);
    this.initializeWinstonLogger();
  }

  async onModuleInit() {
    this.nestLogger.log('Centralized logging service initialized');
  }

  /**
   * Auto-detect service name from call stack
   */
  private getServiceName(): string {
    const stack = new Error().stack;
    if (!stack) return 'Unknown';

    const lines = stack.split('\n');
    // Look for service class names in the stack, but skip LoggingService itself
    for (const line of lines) {
      const match = line.match(/at\s+(\w+Service|\w+Controller|\w+Repository)\./);
      if (match && match[1] !== 'LoggingService') {
        return match[1];
      }
    }
    return 'Unknown';
  }

  /**
   * Enhance context with service name if not provided
   */
  private enhanceContext(context?: LogContext): LogContext {
    const enhanced = { ...context };
    if (!enhanced.serviceName) {
      enhanced.serviceName = this.getServiceName();
    }

    // Add serviceName directly to context, not in nested fields
    // Winston's defaultMeta already handles label, service, environment
    return enhanced;
  }

  /**
   * Create a logger instance for a specific service
   * This is the recommended way to get proper service name detection
   */
  createServiceLogger(serviceName: string) {
    return {
      info: (message: string, context?: LogContext) => this.info(message, { ...context, serviceName }),
      warn: (message: string, context?: LogContext) => this.warn(message, { ...context, serviceName }),
      error: (message: string, context?: LogContext) => this.error(message, { ...context, serviceName }),
      debug: (message: string, context?: LogContext) => this.debug(message, { ...context, serviceName }),
    };
  }

  private initializeWinstonLogger(): void {
    // Console format similar to reference implementation
    const consoleFormat = winston.format.printf((data) => {
      const { message, level, timestamp, label, ...metadata } = data;
      const splat = metadata[Symbol.for('splat')];

      // Color codes for different log levels
      const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
          case 'error':
            return '\x1b[31m'; // Red
          case 'warn':
            return '\x1b[33m'; // Yellow
          case 'info':
            return '\x1b[32m'; // Green
          case 'debug':
            return '\x1b[36m'; // Cyan
          default:
            return '\x1b[37m'; // White
        }
      };

      const resetColor = '\x1b[0m';
      const levelColor = getLevelColor(level);
      const coloredLevel = `${levelColor}${level.toUpperCase()}${resetColor}`;

      // Add colors for different parts
      const serviceColor = '\x1b[35m'; // Magenta for service name
      const timeColor = '\x1b[90m'; // Gray for timestamp

      return `${serviceColor}[${label}]${resetColor} ${timeColor}[${timestamp}]${resetColor} [${coloredLevel}] ${utilFormat(message, splat || '')}`;
    });

    const transportsList: winston.transport[] = [
      // Console transport with colors
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          // Remove winston.format.colorize() to avoid conflict with custom colors
          consoleFormat,
        ),
      }),
    ];

    // Add Elasticsearch transport if not disabled and not in local environment
    if (!this.esLogConfig?.disabled && this.appConfig?.nodeEnv !== 'Local') {
      try {
        const esTransportOptions = {
          level: this.esLogConfig.level || this.getLogLevel(),
          indexPrefix: this.esLogConfig.prefix,
          indexSuffixPattern: 'YYYY.MM.DD',
          clientOpts: {
            nodes: this.esLogConfig.node ? [this.esLogConfig.node] : [],
            auth: {
              username: this.esLogConfig.user,
              password: this.esLogConfig.password,
            },
          },
          retryLimit: this.esLogConfig.retryLimit,
          healthCheckTimeout: this.esLogConfig.healthCheckTimeout,
          flushInterval: this.esLogConfig.flushInterval,
          buffering: this.esLogConfig.buffering,
          bufferLimit: this.esLogConfig.bufferLimit,
          apm: this.monitoringService.getAgent(), // APM integration
        };

        transportsList.push(new ElasticsearchTransport(esTransportOptions));
        this.nestLogger.log(`Elasticsearch transport configured: ${this.esLogConfig.node}`);
      } catch (error) {
        this.nestLogger.warn(`Failed to configure Elasticsearch transport: ${error.message}`);
      }
    }

    this.winstonLogger = winston.createLogger({
      level: this.getLogLevel(),
      defaultMeta: {
        label: this.elasticApmConfig?.serviceName,
        service: this.elasticApmConfig?.serviceName,
        environment: this.appConfig?.nodeEnv,
      },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: transportsList,
    });
  }

  private getLogLevel(): string {
    // Use LOGGING_LEVEL_DEFAULT if configured
    const configuredLevel = this.loggingConfig?.logLevel?.default;
    if (configuredLevel) {
      return configuredLevel.toLowerCase();
    }

    // Use ES_LOG_LEVEL as fallback if configured
    const esLogLevel = this.esLogConfig?.level;
    if (esLogLevel) {
      return esLogLevel.toLowerCase();
    }

    // Fallback to environment-based logic
    const nodeEnv = this.appConfig?.nodeEnv || 'development';
    return nodeEnv === 'production' ? 'info' : 'debug';
  }

  /**
   * Log info level message
   */
  info(message: string, context?: LogContext): void {
    this.winstonLogger.info(message, this.enhanceContext(context));
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: LogContext): void {
    this.winstonLogger.warn(message, this.enhanceContext(context));
  }

  /**
   * Log error level message
   */
  error(message: string, context?: LogContext): void {
    this.winstonLogger.error(message, this.enhanceContext(context));
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: LogContext): void {
    this.winstonLogger.debug(message, this.enhanceContext(context));
  }

  /**
   * Log HTTP request
   */
  logRequest(method: string, url: string, context: LogContext): void {
    this.info(`→ ${method} ${url}`, {
      type: 'REQUEST',
      method,
      url,
      ...this.enhanceContext(context),
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(method: string, url: string, statusCode: number, duration: string, context: LogContext): void {
    this.info(`← ${method} ${url} ${statusCode} ${duration}`, {
      type: 'RESPONSE',
      method,
      url,
      statusCode,
      duration,
      ...this.enhanceContext(context),
    });
  }

  /**
   * Log HTTP error
   */
  logError(method: string, url: string, error: any, duration: string, context: LogContext): void {
    this.error(`✗ ${method} ${url} ${error.status || 500} ${duration}`, {
      type: 'ERROR',
      method,
      url,
      error: error.message,
      stack: error.stack,
      statusCode: error.status || 500,
      duration,
      ...this.enhanceContext(context),
    });
  }

  /**
   * Log business logic events
   */
  logEvent(event: string, context: LogContext): void {
    this.info(`${event}`, {
      type: 'EVENT',
      event,
      ...this.enhanceContext(context),
    });
  }

  /**
   * Log performance metrics
   */
  logMetrics(operation: string, duration: number, context: LogContext): void {
    this.info(` ${operation} completed in ${duration}ms`, {
      type: 'METRICS',
      operation,
      duration: `${duration}ms`,
      ...this.enhanceContext(context),
    });
  }

  /**
   * Get Winston logger instance for advanced usage
   */
  getWinstonLogger(): winston.Logger {
    return this.winstonLogger;
  }
}
