import { AggregatorEntity } from '@domain/entities';
import { IPageResponse } from '@domain/interfaces';

export interface IAggregatorRepository {
  save(aggregator: AggregatorEntity): Promise<AggregatorEntity>;
  findByName(name: string): Promise<AggregatorEntity | null>;
  findAll(includeInactive?: boolean): Promise<AggregatorEntity[]>;
  getPage(
    status: string | null,
    createdBy: string | null,
    pageNumber: number,
    pageSize: number,
  ): Promise<IPageResponse<AggregatorEntity>>;
  deleteByName(name: string, deletedBy?: string): Promise<boolean>;
}
