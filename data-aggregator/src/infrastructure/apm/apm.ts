/**
 * APM Initialization
 * This file must be imported before any other modules to ensure proper instrumentation
 */

// Load environment variables first
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// Import APM agent early
let apm: any;

try {
  // Only initialize APM if configuration is available
  if (process.env.ELASTIC_APM_SERVER_URLS && process.env.ELASTIC_APM_SERVICE_NAME) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    apm = require('elastic-apm-node').start({
      serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
      serverUrl: process.env.ELASTIC_APM_SERVER_URLS,
      secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || undefined,
      environment: process.env.ELASTIC_APM_ENVIRONMENT || process.env.NODE_ENV || 'development',
      logLevel: process.env.ELASTIC_APM_LOG_LEVEL || 'error',
      captureBody: process.env.ELASTIC_APM_CAPTURE_BODY || 'errors',

      // Disable central config to use local settings
      centralConfig: false,

      // Performance settings
      transactionSampleRate: getTransactionSampleRate(),
      captureSpanStackTraces: process.env.NODE_ENV !== 'production',
      stackTraceLimit: 50,

      // Error settings
      captureErrorLogStackTraces: 'always',
      errorOnAbortedRequests: false,

      // HTTP settings
      captureHeaders: true,
      usePathAsTransactionName: true,

      // Custom settings - disable problematic patches that cause warnings
      disableInstrumentations: [],

      // Custom metadata
      globalLabels: {
        service: process.env.ELASTIC_APM_SERVICE_NAME,
        environment: process.env.ELASTIC_APM_ENVIRONMENT || process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      },
    });

    console.log(`APM agent started for service: ${process.env.ELASTIC_APM_SERVICE_NAME}`);
    console.log(`APM server: ${process.env.ELASTIC_APM_SERVER_URLS}`);
    console.log(`APM environment: ${process.env.ELASTIC_APM_ENVIRONMENT || process.env.NODE_ENV || 'development'}`);
    console.log(`APM log level: ${process.env.ELASTIC_APM_LOG_LEVEL || 'info'}`);
  } else {
    console.log(' APM configuration not found. Skipping APM initialization.');
  }
} catch (error) {
  console.error('Failed to initialize APM agent:', error.message);
}

function getTransactionSampleRate(): number {
  const nodeEnv = process.env.NODE_ENV || 'development';

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

export default apm;
