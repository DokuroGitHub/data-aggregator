import { AggregatorEntity } from '@domain/entities';
import { IPageResponse } from '@domain/interfaces';

export interface IAggregatorExecutionSource {
  name: string;
  status: 'success' | 'failed';
  error: string;
  totalItem: number;
}

export interface IAggregatorExecutionResult {
  sources: IAggregatorExecutionSource[];
  totalItem: number;
  data: unknown;
}

export interface IAggregatorService {
  save(aggregator: AggregatorEntity): Promise<AggregatorEntity>;
  findByName(name: string): Promise<AggregatorEntity | null>;
  executeByName(name: string, params?: Record<string, unknown>): Promise<IAggregatorExecutionResult | null>;
  findAll(includeInactive?: boolean): Promise<AggregatorEntity[]>;
  getPage(
    status: string | null,
    createdBy: string | null,
    pageNumber: number,
    pageSize: number,
  ): Promise<IPageResponse<AggregatorEntity>>;
  deleteByName(name: string, deletedBy?: string): Promise<boolean>;
}
