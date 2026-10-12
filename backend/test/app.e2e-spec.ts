import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface HealthResponseBody {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
    type: string;
  };
}

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health'],
    });
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 10000);

  it('/health (GET)', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer).get('/health');
    expect([200, 503]).toContain(response.status);
    const body = response.body as HealthResponseBody;
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptimeSeconds');
    expect(body).toHaveProperty('database');
    expect(body.database).toHaveProperty('status');
    expect(body.database.type).toBe('postgresql');
  }, 15000);
});
