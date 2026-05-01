import { CONFIG_NAMES } from '@common/constants';
import { IAppConfiguration, IElasticApmConfiguration } from '@domain/interfaces';
import { IMonitoringService } from '@domain/services';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Import APM agent
let apm: any;
try {
  apm = require('elastic-apm-node');
} catch (error) {
  // APM not available
}

@Injectable()
export class ApmService implements IMonitoringService, OnModuleInit {
  private readonly logger = new Logger(ApmService.name);
  private elasticApmConfig: IElasticApmConfiguration;
  private appConfig: IAppConfiguration;

  private apmAgent: any;

  constructor(private readonly configService: ConfigService) {
    this.elasticApmConfig = this.configService.get<IElasticApmConfiguration>(CONFIG_NAMES.ELASTIC_APM);

    this.appConfig = this.configService.get<IAppConfiguration>(CONFIG_NAMES.APPLICATION);
  }

  async onModuleInit() {
    this.initializeApm();
  }

  private initializeApm(): void {
    if (!apm) {
      this.logger.warn('Elastic APM agent not available. Skipping APM initialization.');
      return;
    }

    if (!this.elasticApmConfig?.serverUrls || !this.elasticApmConfig?.serviceName) {
      this.logger.warn('APM configuration incomplete. Skipping APM initialization.');
      return;
    }

    try {
      // Check if APM is already started
      if (apm.isStarted()) {
        this.logger.log('APM agent already started');
        this.apmAgent = apm;
        return;
      }

      // Start APM agent
      this.apmAgent = apm.start({
        serviceName: this.elasticApmConfig.serviceName,
        serverUrl: this.elasticApmConfig.serverUrls,
        secretToken: this.elasticApmConfig.secretToken || undefined,
        environment: this.elasticApmConfig.environment || 'development',
        logLevel: this.elasticApmConfig.logLevel || 'info',
        captureBody: this.elasticApmConfig.captureBody || 'errors',

        // Performance settings
        transactionSampleRate: this.getTransactionSampleRate(),
        captureSpanStackTraces: this.appConfig.nodeEnv !== 'production',
        stackTraceLimit: 50,

        // Error settings
        captureErrorLogStackTraces: 'always',
        errorOnAbortedRequests: false,

        // HTTP settings
        captureHeaders: true,
        usePathAsTransactionName: true,

        // Custom settings
        addPatch: {
          http: true,
          https: true,
          'mongodb-core': true,
          redis: true,
        },

        // Disable certain instrumentations if needed
        disableInstrumentations: [],

        // Custom metadata
        globalLabels: {
          service: this.elasticApmConfig.serviceName,
          environment: this.elasticApmConfig.environment,
          version: process.env.npm_package_version || '1.0.0',
        },
      });

      this.logger.log(`APM agent started successfully for service: ${this.elasticApmConfig.serviceName}`);
      this.logger.log(`APM server: ${this.elasticApmConfig.serverUrls}`);
      this.logger.log(`APM environment: ${this.elasticApmConfig.environment}`);
    } catch (error) {
      this.logger.error(`Failed to initialize APM agent: ${error.message}`, error.stack);
    }
  }

  private getTransactionSampleRate(): number {
    const nodeEnv = this.appConfig?.nodeEnv;

    // Lower sample rate in production to reduce overhead
    switch (nodeEnv) {
      case 'production':
        return 0.1; // 10% sampling
      case 'staging':
        return 0.5; // 50% sampling
      default:
        return 1.0; // 100% sampling for development
    }
  }

  /**
   * Get the APM agent instance
   */
  getAgent(): any {
    return this.apmAgent;
  }

  /**
   * Check if APM is active
   */
  isActive(): boolean {
    return this.apmAgent && apm && apm.isStarted();
  }

  /**
   * Start a custom transaction
   */
  startTransaction(name: string, type: string = 'custom'): any {
    if (!this.isActive()) return null;

    try {
      return this.apmAgent.startTransaction(name, type);
    } catch (error) {
      this.logger.warn(`Failed to start APM transaction: ${error.message}`);
      return null;
    }
  }

  /**
   * Start a custom span
   */
  startSpan(name: string, type: string = 'custom'): any {
    if (!this.isActive()) return null;

    try {
      return this.apmAgent.startSpan(name, type);
    } catch (error) {
      this.logger.warn(`Failed to start APM span: ${error.message}`);
      return null;
    }
  }

  /**
   * Capture an error
   */
  captureError(error: Error, context?: any): void {
    if (!this.isActive()) return;

    try {
      this.apmAgent.captureError(error, context);
    } catch (apmError) {
      this.logger.warn(`Failed to capture error in APM: ${apmError.message}`);
    }
  }

  /**
   * Add custom labels to current transaction
   */
  addLabels(labels: Record<string, string | number | boolean>): void {
    if (!this.isActive()) return;

    try {
      this.apmAgent.addLabels(labels);
    } catch (error) {
      this.logger.warn(`Failed to add APM labels: ${error.message}`);
    }
  }

  /**
   * Add user context to current transaction
   */
  setUserContext(user: { id?: string; username?: string; email?: string }): void {
    if (!this.isActive()) return;

    try {
      this.apmAgent.setUserContext(user);
    } catch (error) {
      this.logger.warn(`Failed to set APM user context: ${error.message}`);
    }
  }

  /**
   * Add custom context to current transaction
   */
  setCustomContext(context: Record<string, any>): void {
    if (!this.isActive()) return;

    try {
      this.apmAgent.setCustomContext(context);
    } catch (error) {
      this.logger.warn(`Failed to set APM custom context: ${error.message}`);
    }
  }

  /**
   * Flush APM data (useful for testing or shutdown)
   */
  async flush(): Promise<void> {
    if (!this.isActive()) return;

    try {
      await new Promise<void>((resolve) => {
        this.apmAgent.flush(() => resolve());
      });
      this.logger.log('APM data flushed successfully');
    } catch (error) {
      this.logger.warn(`Failed to flush APM data: ${error.message}`);
    }
  }
}
