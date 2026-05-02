import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AGGREGATOR_SERVICE, JWT_SERVICE } from './../src/common/constants';
import { AggregatorController } from './../src/presentation/controllers/aggregator.controller';
import * as request from 'supertest';

describe('AggregatorController (e2e)', () => {
  let app: INestApplication;

  const mockAggregatorService = {
    save: jest.fn(),
    findAll: jest.fn(),
    getPage: jest.fn(),
    findByName: jest.fn(),
    executeByName: jest.fn(),
    deleteByName: jest.fn(),
  };

  const mockJwtService = {
    decodeUserToken: jest.fn(),
  };

  const sampleAggregator = {
    id: 1,
    name: 'unified-document-view-by-vin',
    description: 'Aggregator description',
    status: 'active',
    params: ['vin'],
    sources: [
      {
        name: 'Sales System',
        method: 'GET',
        url: 'http://localhost:8001/search?q={{vin}}',
      },
    ],
    fn: 'return value;',
    shouldRemoveDuplicates: false,
    createdBy: 'test-user',
    createdAt: new Date('2026-05-02T00:00:00.000Z'),
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AggregatorController],
      providers: [
        {
          provide: AGGREGATOR_SERVICE,
          useValue: mockAggregatorService,
        },
        {
          provide: JWT_SERVICE,
          useValue: mockJwtService,
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

  it('POST /aggregators creates aggregator', async () => {
    mockAggregatorService.save.mockResolvedValue(sampleAggregator);

    const payload = {
      name: 'unified-document-view-by-vin',
      description: 'Aggregator description',
      status: 'active',
      params: ['vin'],
      sources: [
        {
          name: 'Sales System',
          method: 'GET',
          url: 'http://localhost:8001/search?q={{vin}}',
        },
      ],
      fn: 'return value;',
      shouldRemoveDuplicates: false,
      createdBy: 'test-user',
    };

    const response = await request(app.getHttpServer()).post('/aggregators').send(payload).expect(201);

    expect(response.body.name).toBe(payload.name);
    expect(mockAggregatorService.save).toHaveBeenCalledTimes(1);
  });

  it('POST /aggregators validates required fields', async () => {
    await request(app.getHttpServer())
      .post('/aggregators')
      .send({
        name: 'invalid-aggregator',
      })
      .expect(400);
  });

  it('GET /aggregators/get-all uses includeInactive=false by default', async () => {
    mockAggregatorService.findAll.mockResolvedValue([sampleAggregator]);

    const response = await request(app.getHttpServer()).get('/aggregators/get-all').expect(200);

    expect(response.body).toHaveLength(1);
    expect(mockAggregatorService.findAll).toHaveBeenCalledWith(false);
  });

  it('GET /aggregators/get-all supports includeInactive=true', async () => {
    mockAggregatorService.findAll.mockResolvedValue([sampleAggregator]);

    await request(app.getHttpServer()).get('/aggregators/get-all?includeInactive=true').expect(200);

    expect(mockAggregatorService.findAll).toHaveBeenCalledWith(true);
  });

  it('GET /aggregators returns paginated response', async () => {
    mockAggregatorService.getPage.mockResolvedValue({
      data: [sampleAggregator],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const response = await request(app.getHttpServer())
      .get('/aggregators?status=active&createdBy=test-user&page=1&pageSize=10')
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(mockAggregatorService.getPage).toHaveBeenCalledWith('active', 'test-user', 1, 10);
  });

  it('GET /aggregators/:name returns 404 when not found', async () => {
    mockAggregatorService.findByName.mockResolvedValue(null);

    await request(app.getHttpServer()).get('/aggregators/missing').expect(404);
  });

  it('GET /aggregators/:name returns aggregator when found', async () => {
    mockAggregatorService.findByName.mockResolvedValue(sampleAggregator);

    const response = await request(app.getHttpServer()).get('/aggregators/unified-document-view-by-vin').expect(200);

    expect(response.body.name).toBe('unified-document-view-by-vin');
  });

  it('POST /aggregators/:name executes aggregator', async () => {
    mockAggregatorService.executeByName.mockResolvedValue({
      sources: [
        {
          name: 'Sales System',
          status: 'success',
          error: '',
          totalItem: 1,
        },
      ],
      totalItem: 1,
      data: [{ url: 'doc-url', mimeType: 'pdf' }],
    });

    const response = await request(app.getHttpServer())
      .post('/aggregators/unified-document-view-by-vin')
      .send({ vin: '101' })
      .expect(201);

    expect(response.body.totalItem).toBe(1);
    expect(mockAggregatorService.executeByName).toHaveBeenCalledWith('unified-document-view-by-vin', { vin: '101' });
  });

  it('POST /aggregators/:name returns 404 when aggregator does not exist', async () => {
    mockAggregatorService.executeByName.mockResolvedValue(null);

    await request(app.getHttpServer()).post('/aggregators/missing').send({ vin: '101' }).expect(404);
  });

  it('DELETE /aggregators/:name returns 401 when token is invalid', async () => {
    mockJwtService.decodeUserToken.mockReturnValue(null);

    await request(app.getHttpServer()).delete('/aggregators/unified-document-view-by-vin').expect(401);
  });

  it('DELETE /aggregators/:name returns 404 when aggregator is not found', async () => {
    mockJwtService.decodeUserToken.mockReturnValue({
      full_name: 'Test User',
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    mockAggregatorService.deleteByName.mockResolvedValue(false);

    await request(app.getHttpServer())
      .delete('/aggregators/unified-document-view-by-vin')
      .set('Authorization', 'Bearer valid-token')
      .expect(404);

    expect(mockJwtService.decodeUserToken).toHaveBeenCalledWith('valid-token');
    expect(mockAggregatorService.deleteByName).toHaveBeenCalledWith('unified-document-view-by-vin', 'Test User');
  });

  it('DELETE /aggregators/:name returns 204 when delete succeeds', async () => {
    mockJwtService.decodeUserToken.mockReturnValue({
      full_name: 'Test User',
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    mockAggregatorService.deleteByName.mockResolvedValue(true);

    await request(app.getHttpServer())
      .delete('/aggregators/unified-document-view-by-vin')
      .set('Authorization', 'Bearer valid-token')
      .expect(204);

    expect(mockAggregatorService.deleteByName).toHaveBeenCalledWith('unified-document-view-by-vin', 'Test User');
  });
});
