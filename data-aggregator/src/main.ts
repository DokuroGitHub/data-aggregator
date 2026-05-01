// Import APM first for proper instrumentation
import './infrastructure/apm/apm';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CONFIG_NAMES } from './common/constants';
import { IAppConfiguration } from './domain/interfaces';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for SSE and API requests
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const appConfig = configService.get<IAppConfiguration>(CONFIG_NAMES.APPLICATION);

  const port = appConfig?.port || 8000;

  // Setup Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Documentation for Data Aggregator')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'authentication token',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  console.log(`🚀 Starting server on port: ${port}`);
  console.log(`🌍 Environment: ${appConfig?.nodeEnv || 'development'}`);

  await app.listen(port);
  console.log(`🚀 Server is running on port: ${port}`);
}
bootstrap();
