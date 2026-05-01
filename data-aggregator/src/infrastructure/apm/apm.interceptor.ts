import { MONITORING_SERVICE } from '@common/constants';
import { IMonitoringService } from '@domain/services';
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  constructor(
    @Inject(MONITORING_SERVICE)
    private readonly monitoringService: IMonitoringService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.monitoringService.isActive()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    // Add labels to current transaction
    this.monitoringService.addLabels({
      http_method: method,
      http_url: url,
      http_route: this.extractRoute(request),
    });

    // Add user context if available
    const userId = this.extractUserId(request);
    if (userId) {
      this.monitoringService.setUserContext({ id: userId });
    }

    // Add custom context
    this.monitoringService.setCustomContext({
      correlationId: (request as any).correlationId,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
    });

    return next.handle().pipe(
      tap(() => {
        // Transaction completed successfully
        // APM will automatically capture the response
      }),
      catchError((error) => {
        // Error will be captured by GlobalExceptionFilter
        throw error;
      }),
    );
  }

  private extractRoute(request: Request): string {
    // Try to get the route pattern from NestJS
    const route = (request as any).route;
    if (route && route.path) {
      return route.path;
    }

    // Fallback to URL path
    return request.url.split('?')[0];
  }

  private extractUserId(request: Request): string | undefined {
    // Try to extract user ID from various sources
    const authHeader = request.get('Authorization');
    if (authHeader) {
      // This is a simplified example - you might need to decode JWT or use other methods
      // depending on your authentication system
      try {
        // You can implement JWT decoding here if needed
        // const token = authHeader.replace('Bearer ', '');
        // const decoded = jwt.decode(token);
        // return decoded?.sub || decoded?.userId;
      } catch (error) {
        // Ignore JWT decode errors
      }
    }

    // Check for user ID in headers or query params
    return request.get('X-User-ID') || (request.query.userId as string);
  }
}
