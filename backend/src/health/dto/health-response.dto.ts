import { ApiProperty } from '@nestjs/swagger';

export class DatabaseHealthStatus {
  @ApiProperty({ example: 'connected', enum: ['connected', 'unreachable'] })
  status: 'connected' | 'unreachable';

  @ApiProperty({ example: 'postgresql' })
  type: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded'] })
  status: 'ok' | 'degraded';

  @ApiProperty({ example: '2026-10-13T00:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 42.12 })
  uptimeSeconds: number;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ type: DatabaseHealthStatus })
  database: DatabaseHealthStatus;
}
