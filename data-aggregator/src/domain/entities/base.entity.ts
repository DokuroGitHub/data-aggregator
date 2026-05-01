export class BaseEntity {
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;

  constructor(data: Partial<BaseEntity> = {}) {
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedBy = data.updatedBy;
    this.updatedAt = data.updatedAt;
    this.deletedBy = data.deletedBy;
    this.deletedAt = data.deletedAt;
  }
}
