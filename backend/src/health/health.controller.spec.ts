import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrismaService: { isHealthy: jest.Mock };
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockPrismaService = {
      isHealthy: jest.fn(),
    };

    mockConfigService = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === 'NODE_ENV') return 'test';
          return defaultValue;
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return 200 OK with connected status when database is healthy', async () => {
    mockPrismaService.isHealthy.mockResolvedValue({ connected: true });

    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn().mockReturnThis();

    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    await controller.checkHealth(mockResponse);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        environment: 'test',
        database: {
          status: 'connected',
          type: 'postgresql',
        },
      }),
    );
  });

  it('should return 503 SERVICE_UNAVAILABLE when database is unreachable', async () => {
    mockPrismaService.isHealthy.mockResolvedValue({
      connected: false,
      error: 'Connection refused',
    });

    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn().mockReturnThis();

    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    await controller.checkHealth(mockResponse);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
        database: {
          status: 'unreachable',
          type: 'postgresql',
        },
      }),
    );
  });
});
