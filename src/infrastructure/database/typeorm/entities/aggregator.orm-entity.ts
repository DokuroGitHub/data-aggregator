import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableOrmEntity } from './auditable.orm-entity';

@Entity({ name: 'aggregators' })
export class AggregatorOrmEntity extends AuditableOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'inactive';

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  params: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  sources: Array<Record<string, unknown>>;

  @Column({ name: 'fn', type: 'text', nullable: true })
  fn?: string;

  @Column({ name: 'should_remove_duplicates', type: 'boolean', default: false })
  shouldRemoveDuplicates: boolean;
}
