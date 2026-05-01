export interface LogContext {
  correlationId?: string;
  userId?: string;
  conversationId?: string;
  serviceName?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  duration?: string;
  statusCode?: number;
  error?: string;
  stack?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ILoggingService {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;

  // HTTP logging
  logRequest(method: string, url: string, context: LogContext): void;
  logResponse(method: string, url: string, statusCode: number, duration: string, context: LogContext): void;
  logError(method: string, url: string, error: any, duration: string, context: LogContext): void;

  // Business logging
  logEvent(event: string, context: LogContext): void;
  logMetrics(operation: string, duration: number, context: LogContext): void;

  // Service logger factory
  createServiceLogger(serviceName: string): {
    info: (message: string, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    error: (message: string, context?: LogContext) => void;
    debug: (message: string, context?: LogContext) => void;
  };
}
