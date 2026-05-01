import { AggregatorStatus } from '@common/enums';
import { IPageResponse } from '@domain/interfaces';
import { AggregatorEntity } from '@domain/entities';
import { IAggregatorRepository } from '@domain/repositories';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AggregatorOrmEntity } from '../entities/aggregator.orm-entity';

@Injectable()
export class AggregatorRepository implements IAggregatorRepository {
  constructor(
    @InjectRepository(AggregatorOrmEntity)
    private readonly repository: Repository<AggregatorOrmEntity>,
  ) {}

  async save(aggregator: AggregatorEntity): Promise<AggregatorEntity> {
    const payload = this.repository.create({
      ...this.toOrm(aggregator),
      updatedBy: aggregator.updatedBy || aggregator.createdBy,
      deletedBy: null,
      deletedAt: null,
    });

    await this.repository.upsert(payload, ['name']);

    const saved = await this.repository.findOne({
      where: {
        name: aggregator.name,
        deletedAt: IsNull(),
      },
    });

    return this.toDomain(saved || payload);
  }

  async findByName(name: string): Promise<AggregatorEntity | null> {
    const aggregator = await this.repository.findOne({
      where: {
        name,
        deletedAt: IsNull(),
      },
    });

    return aggregator ? this.toDomain(aggregator) : null;
  }

  async findAll(includeInactive = false): Promise<AggregatorEntity[]> {
    const where = includeInactive
      ? { deletedAt: IsNull() }
      : {
          status: 'active' as const,
          deletedAt: IsNull(),
        };

    const records = await this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    return records.map((record) => this.toDomain(record));
  }

  async getPage(
    status: AggregatorStatus | null = null,
    createdBy: string | null = null,
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<IPageResponse<AggregatorEntity>> {
    const where = {
      ...(status ? { status } : {}),
      ...(createdBy ? { createdBy } : {}),
    };
    const skip = (pageNumber - 1) * pageSize;

    const records = await this.repository.find({
      where: where,
      order: {
        updatedAt: 'DESC',
      },
      take: pageSize,
      skip: skip,
    });

    const data = records.map((record) => this.toDomain(record));
    const count = await this.repository.count({ where: where });
    const totalPage = Math.ceil(count / pageSize);

    return {
      pageNumber: +pageNumber,
      pageSize: +pageSize,
      totalPage,
      totalItem: count,
      hasPreviousPage: +pageNumber > 1,
      hasNextPage: +pageNumber < totalPage,
      data: data,
    };
  }

  async deleteByName(name: string, deletedBy?: string): Promise<boolean> {
    const found = await this.repository.findOne({
      where: {
        name,
        deletedAt: IsNull(),
      },
    });

    if (!found) {
      return false;
    }

    await this.repository.update({ id: found.id }, { deletedBy });
    await this.repository.softDelete({ id: found.id });
    return true;
  }

  private toDomain(record: AggregatorOrmEntity): AggregatorEntity {
    return new AggregatorEntity({
      id: record.id,
      name: record.name,
      description: record.description,
      status: record.status as AggregatorStatus,
      params: record.params,
      sources: (record.sources || []) as any,
      fn: record.fn,
      shouldRemoveDuplicates: record.shouldRemoveDuplicates,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt,
      deletedBy: record.deletedBy,
      deletedAt: record.deletedAt,
    });
  }

  private toOrm(entity: AggregatorEntity): Partial<AggregatorOrmEntity> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      params: entity.params,
      sources: entity.sources as any,
      fn: entity.fn,
      shouldRemoveDuplicates: entity.shouldRemoveDuplicates,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
