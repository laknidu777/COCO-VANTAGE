import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const host = configService.get<string>('HOST', '0.0.0.0');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const rawCorsOrigin = configService.get<string>('CORS_ORIGIN');
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ||
    configService.get<string>('STOREFRONT_URL');
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
  const rawSwaggerEnabled = configService.get<string>('SWAGGER_ENABLED');

  // Swagger is enabled by default in development and test environments,
  // but strictly disabled in production unless explicitly enabled via SWAGGER_ENABLED=true.
  const swaggerEnabled =
    rawSwaggerEnabled !== undefined
      ? rawSwaggerEnabled === 'true'
      : nodeEnv !== 'production';

  // Parse, normalize, and validate CORS origins
  const originsSet = new Set<string>();

  if (rawCorsOrigin) {
    for (const origin of rawCorsOrigin.split(',')) {
      const trimmed = origin.trim();
      if (trimmed) {
        originsSet.add(trimmed);
      }
    }
  }

  if (frontendUrl) {
    try {
      const parsed = new URL(frontendUrl);
      originsSet.add(parsed.origin);
    } catch {
      const trimmed = frontendUrl.trim();
      if (trimmed) {
        originsSet.add(trimmed);
      }
    }
  }

  // In production, prevent silent insecure fallbacks
  if (nodeEnv === 'production' && originsSet.size === 0) {
    throw new Error(
      'CORS configuration error: At least one origin must be configured via CORS_ORIGIN or FRONTEND_URL in production.',
    );
  }

  // Safe fallback for local development only
  if (originsSet.size === 0) {
    originsSet.add('http://localhost:3000');
  }

  const allowedOrigins = Array.from(originsSet);

  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable graceful shutdown hooks (for SIGINT / SIGTERM / container termination)
  app.enableShutdownHooks();

  // Centralized Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Request Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global API prefix, excluding /health so health checks remain at /health
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'],
  });

  // Swagger Documentation
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('COCO-VANTAGE API')
      .setDescription(
        'COCO-VANTAGE Premium E-Commerce Backend Service API Documentation',
      )
      .setVersion('1.0.0')
      .addTag('Health', 'Health status and connectivity endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'COCO-VANTAGE API Docs',
    });
  }

  await app.listen(port, host);
  logger.log(`Server listening on host: ${host}, port: ${port} (environment: ${nodeEnv})`);
  logger.log(`Health endpoint: /health`);
  logger.log(`Global API prefix: /${apiPrefix}`);
  if (swaggerEnabled) {
    logger.log(`Swagger documentation enabled at: /${swaggerPath}`);
  } else {
    logger.log('Swagger documentation: disabled');
  }
}

bootstrap().catch((err: unknown) => {
  const logger = new Logger('Bootstrap');
  const message = err instanceof Error ? err.message : String(err);
  logger.error(`Failed to start application: ${message}`);
  process.exit(1);
});
