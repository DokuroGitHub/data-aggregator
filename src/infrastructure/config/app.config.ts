import { CONFIG_NAMES } from '@common/constants';
import {
  IAppConfiguration,
  IElasticApmConfiguration,
  IEsLogConfiguration,
  IPostgresConfiguration,
} from '@domain/interfaces';
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs(
  CONFIG_NAMES.APPLICATION, // Application configuration
  (): IAppConfiguration => ({
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    allowedHosts: process.env.ALLOWED_HOSTS,
    enableRequestResponseLogging: process.env.ENABLE_REQUEST_RESPONSE_LOGGING === 'false',
  }),
);

export const postgresConfig = registerAs(
  CONFIG_NAMES.POSTGRES, // PostgreSQL configuration
  (): IPostgresConfiguration => ({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB || 'aggregator',
    schema: process.env.POSTGRES_SCHEMA || 'public',
    synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
    logging: process.env.POSTGRES_LOGGING === 'true',
    maxQueryExecutionTime: Number(process.env.POSTGRES_MAX_QUERY_EXECUTION_TIME || 3000),
  }),
);

export const elasticApmConfig = registerAs(
  CONFIG_NAMES.ELASTIC_APM, // Elastic APM configuration
  (): IElasticApmConfiguration => ({
    serverUrls: process.env.ELASTIC_APM_SERVER_URLS,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
    environment: process.env.ELASTIC_APM_ENVIRONMENT,
    logLevel: process.env.ELASTIC_APM_LOG_LEVEL,
    captureBody: process.env.ELASTIC_APM_CAPTURE_BODY,
  }),
);

export const esLogConfig = registerAs(
  CONFIG_NAMES.ES_LOG, // Elasticsearch Logging configuration
  (): IEsLogConfiguration => ({
    disabled: process.env.ES_LOG_DISABLED === 'true',
    level: process.env.ES_LOG_LEVEL || 'error',
    prefix: process.env.ES_LOG_PREFIX || 'logs-ci-fai-data-aggregator',
    user: process.env.ES_LOG_USER || '',
    password: process.env.ES_LOG_PASSWORD || '',
    node: process.env.ES_LOG_NODE || '',
    retryLimit: Number(process.env.ES_LOG_RETRY_LIMIT) || 5,
    healthCheckTimeout: process.env.ES_LOG_HEALTH_CHECK_TIMEOUT || '30s',
    flushInterval: Number(process.env.ES_LOG_FLUSH_INTERVAL) || 1000,
    buffering: process.env.ES_LOG_BUFFERING !== 'false',
    bufferLimit: Number(process.env.ES_LOG_BUFFER_LIMIT) || 1000,
  }),
);

export const allConfigs = [appConfig, postgresConfig, elasticApmConfig, esLogConfig];
