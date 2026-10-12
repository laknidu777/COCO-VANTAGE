import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const rawCorsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3000',
  );
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');

  // Parse CORS origins from comma-separated list or fallback
  const corsOrigins = rawCorsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (frontendUrl && !corsOrigins.includes(frontendUrl)) {
    corsOrigins.push(frontendUrl);
  }

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable graceful shutdown hooks (for SIGINT / SIGTERM / process termination)
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

  // Swagger Documentation (available in development and non-production modes)
  if (nodeEnv !== 'production') {
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

    logger.log(
      `Swagger documentation available at: http://localhost:${port}/${swaggerPath}`,
    );
  }

  await app.listen(port);
  logger.log(`Backend server listening on: http://localhost:${port}`);
  logger.log(`Health check available at: http://localhost:${port}/health`);
  logger.log(
    `API base route available at: http://localhost:${port}/${apiPrefix}`,
  );
}

bootstrap().catch((err: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application:', err);
  process.exit(1);
});
