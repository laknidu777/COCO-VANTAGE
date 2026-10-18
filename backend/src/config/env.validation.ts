import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  HOST: string = '0.0.0.0';

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  STOREFRONT_URL?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  SWAGGER_PATH: string = 'api/docs';

  @IsString()
  @IsOptional()
  SWAGGER_ENABLED?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => {
        const constraints = err.constraints
          ? Object.values(err.constraints).join(', ')
          : 'invalid';
        return `${err.property}: ${constraints}`;
      })
      .join('; ');
    throw new Error(
      `Environment configuration validation error: ${errorMessages}`,
    );
  }

  // Validate DATABASE_URL format without leaking credentials
  const dbUrl = validatedConfig.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    throw new Error(
      'Environment configuration validation error: DATABASE_URL must be a valid PostgreSQL connection URI starting with postgresql:// or postgres://',
    );
  }

  // Production-specific security assertions
  if (validatedConfig.NODE_ENV === Environment.Production) {
    if (
      !validatedConfig.JWT_ACCESS_SECRET ||
      validatedConfig.JWT_ACCESS_SECRET.length < 32 ||
      validatedConfig.JWT_ACCESS_SECRET.includes('replace-with-a-random-secret')
    ) {
      throw new Error(
        'Environment configuration validation error: JWT_ACCESS_SECRET must be at least 32 characters and cannot be the default placeholder in production.',
      );
    }

    if (
      !validatedConfig.STRIPE_SECRET_KEY ||
      !validatedConfig.STRIPE_SECRET_KEY.startsWith('sk_')
    ) {
      throw new Error(
        'Environment configuration validation error: STRIPE_SECRET_KEY is required and must have a valid Stripe format in production.',
      );
    }

    if (
      !validatedConfig.CORS_ORIGIN &&
      !validatedConfig.FRONTEND_URL &&
      !validatedConfig.STOREFRONT_URL
    ) {
      throw new Error(
        'Environment configuration validation error: In production, at least one CORS origin must be configured via CORS_ORIGIN, FRONTEND_URL, or STOREFRONT_URL.',
      );
    }
  }

  return validatedConfig;
}
