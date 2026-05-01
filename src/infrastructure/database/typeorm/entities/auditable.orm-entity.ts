import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AuditableOrmEntity {
  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_by', type: 'varchar', length: 100, nullable: true })
  deletedBy?: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
