import { AGGREGATOR_SERVICE, JWT_SERVICE } from '@common/constants';
import { AggregatorEntity } from '@domain/entities';
import { IAggregatorExecutionResult, IAggregatorService, IJwtService } from '@domain/services';
import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AggregatorResponseDto, PageResponseDto, SaveAggregatorDto } from '../dto';
import { AggregatorStatus } from '@common/enums';
import { ErrorResponseDto } from '@presentation/dto/error.dto';

@ApiTags('Aggregators')
@Controller('aggregators')
export class AggregatorController {
  constructor(
    @Inject(AGGREGATOR_SERVICE)
    private readonly aggregatorService: IAggregatorService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create or update aggregator definition',
    description: 'Stores aggregator definition in PostgreSQL using TypeORM. Name is used as upsert key.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AggregatorResponseDto,
  })
  async saveAggregator(@Body() dto: SaveAggregatorDto): Promise<AggregatorResponseDto> {
    const saved = await this.aggregatorService.save(
      new AggregatorEntity({
        name: dto.name,
        description: dto.description,
        status: dto.status || AggregatorStatus.ACTIVE,
        params: dto.params,
        sources: dto.sources,
        fn: dto.fn,
        shouldRemoveDuplicates: dto.shouldRemoveDuplicates ?? false,
        createdBy: dto.createdBy,
      }),
    );

    return this.toResponse(saved);
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'Get aggregators',
    description: 'Returns active aggregators by default. Use includeInactive=true to include inactive ones.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [AggregatorResponseDto],
  })
  async getAggregators(@Query('includeInactive') includeInactive?: string): Promise<AggregatorResponseDto[]> {
    const records = await this.aggregatorService.findAll(includeInactive === 'true');
    return records.map((record) => this.toResponse(record));
  }

  // getPage
  @Get()
  @ApiOperation({
    summary: 'Get page of aggregators',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PageResponseDto<AggregatorResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'createdBy', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', type: Number, required: false, example: 10 })
  async getPage(
    @Query('status') status?: string,
    @Query('createdBy') createdBy?: string,
    @Query('page') pageNumber?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const parsedPageNumber = pageNumber ? parseInt(pageNumber, 10) : undefined;
    const parsedPageSize = pageSize ? parseInt(pageSize, 10) : NaN;
    return await this.aggregatorService.getPage(status, createdBy, parsedPageNumber, parsedPageSize);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get aggregator by name' })
  @ApiParam({ name: 'name', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AggregatorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aggregator not found',
  })
  async getAggregatorByName(@Param('name') name: string): Promise<AggregatorResponseDto> {
    const record = await this.aggregatorService.findByName(name);

    if (!record) {
      throw new NotFoundException(`Aggregator ${name} not found`);
    }

    return this.toResponse(record);
  }

  @Post(':name')
  @ApiOperation({ summary: 'Execute aggregator by name' })
  @ApiParam({ name: 'name', type: String, example: 'unified-document-view-by-vin' })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        vin: '101',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        error: '',
        sources: [
          {
            name: 'Sales System',
            status: 'success',
            error: '',
            totalItem: 5,
          },
          {
            name: 'Service System',
            status: 'success',
            error: '',
            totalItem: 6,
          },
        ],
        data: [
          {
            url: 'url_1',
            mimeType: 'pdf',
            source: 'Sales System',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Aggregator not found',
  })
  async executeAggregatorByName(
    @Param('name') name: string,
    @Body() params: Record<string, unknown> = {},
  ): Promise<IAggregatorExecutionResult> {
    const result = await this.aggregatorService.executeByName(name, params);

    if (result === null) {
      throw new NotFoundException(`Aggregator ${name} not found`);
    }

    return {
      sources: result.sources,
      totalItem: result.totalItem,
      data: result.data,
    };
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete aggregator by name' })
  @ApiBearerAuth()
  @ApiParam({ name: 'name', type: String, example: 'unified-document-view-by-vin' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid bearer token',
    type: ErrorResponseDto,
  })
  async deleteAggregatorByName(@Param('name') name: string, @Req() request?: any): Promise<void> {
    const authorization = request?.headers?.authorization || '';
    const decoded = this.jwtService.decodeUserToken(authorization.replace('Bearer ', ''));
    if (!decoded) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp <= nowInSeconds) {
      // throw new UnauthorizedException('Authorization token is expired');
    }

    const deletedBy = decoded.full_name || decoded.name || decoded.email;
    if (!deletedBy) {
      throw new UnauthorizedException('Token does not include user identity');
    }

    const isDeleted = await this.aggregatorService.deleteByName(name, deletedBy);

    if (!isDeleted) {
      throw new NotFoundException(`Aggregator ${name} not found`);
    }
  }

  private toResponse(record: AggregatorEntity): AggregatorResponseDto {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      status: record.status,
      params: record.params,
      sources: record.sources as any,
      fn: record.fn,
      shouldRemoveDuplicates: record.shouldRemoveDuplicates,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt,
    };
  }
}
