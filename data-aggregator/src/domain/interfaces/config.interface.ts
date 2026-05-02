export interface IAppConfiguration {
  port: number;
  nodeEnv: string;
  allowedHosts?: string;
  enableRequestResponseLogging?: boolean;
}

export interface IPostgresConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  synchronize?: boolean;
  logging?: boolean;
  maxQueryExecutionTime?: number;
}

// APM configuration interfaces
export class IElasticApmConfiguration {
  serverUrls: string;
  secretToken: string;
  serviceName: string;
  environment: string;
  logLevel: string;
  captureBody: string;
}

// Logging configuration interfaces
export interface ILoggingConfiguration {
  logLevel: {
    default: string;
  };
}

// Elasticsearch Logging configuration interfaces
export interface IEsLogConfiguration {
  disabled: boolean;
  level: string;
  prefix: string;
  user: string;
  password: string;
  node: string;
  retryLimit: number;
  healthCheckTimeout: string;
  flushInterval: number;
  buffering: boolean;
  bufferLimit: number;
}

// Redis configuration interfaces
export interface IRedisConfiguration {
  host: string;
  port: number;
  password?: string;
  db?: number;
  aggregatorPrefix: string;
  aggregatorTTL: number;
  aggregatorResponsePrefix: string;
  aggregatorResponseTTL: number;
}
