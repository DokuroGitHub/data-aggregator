import { AggregatorStatus } from '@common/enums';
import { BaseEntity } from './base.entity';

export interface AggregatorSource {
  name?: string;
  method: string;
  url: string;
  headers?: Record<string, unknown>;
  body?: Record<string, unknown>;
  fn?: string;
}

export class AggregatorEntity extends BaseEntity {
  id?: number;
  name: string;
  description?: string;
  status: AggregatorStatus;
  params: string[];
  sources: AggregatorSource[];
  fn?: string;
  shouldRemoveDuplicates: boolean;

  constructor(data: Partial<AggregatorEntity>) {
    super(data);
    this.id = data.id;
    this.name = data.name || '';
    this.description = data.description;
    this.status = data.status || AggregatorStatus.ACTIVE;
    this.params = data.params || [];
    this.sources = data.sources || [];
    this.fn = data.fn;
    this.shouldRemoveDuplicates = data.shouldRemoveDuplicates ?? false;
  }
}
