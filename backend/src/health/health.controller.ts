import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Application & Database Health Check',
    description:
      'Performs a live connectivity test against PostgreSQL and returns system status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and database is reachable.',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is degraded or database is unreachable.',
    type: HealthResponseDto,
  })
  async checkHealth(@Res() res: Response): Promise<void> {
    const dbHealth = await this.prismaService.isHealthy();
    const env = this.configService.get<string>('NODE_ENV', 'development');

    const responseBody: HealthResponseDto = {
      status: dbHealth.connected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime() * 100) / 100,
      environment: env,
      database: {
        status: dbHealth.connected ? 'connected' : 'unreachable',
        type: 'postgresql',
      },
    };

    const httpStatus = dbHealth.connected
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(httpStatus).json(responseBody);
  }
}
