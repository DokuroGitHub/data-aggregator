import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HEALTH_SERVICE } from './../src/common/constants';
import { HealthController } from './../src/presentation/controllers/health.controller';
import * as request from 'supertest';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  const mockHealthService = {
    getHealth: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HEALTH_SERVICE,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /health returns service health', async () => {
    mockHealthService.getHealth.mockResolvedValue({
      status: 'up',
      timestamp: '2026-05-02T00:00:00.000Z',
      version: '1.0.0',
      environment: 'test',
    });

    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual({
      status: 'UP',
      timestamp: '2026-05-02T00:00:00.000Z',
      version: '1.0.0',
      environment: 'test',
    });
  });
});
