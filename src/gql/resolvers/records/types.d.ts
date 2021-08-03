// packages
import type { Request } from 'express';

// global
import type { Record, RecordInput, RecordFilter } from 'global/types';

export type { Record, RecordInput, RecordFilter };

export type CreateRecord = (
  args: { record: RecordInput },
  req: Request
) => Promise<Record | undefined>;

export type ListRecords = (
  args: unknow,
  req: Request
) => Promise<Array<Record> | undefined>;

export type EditRecord = (
  args: { record: RecordInput },
  req: Request
) => Promise<Record | undefined>;

export type FilterRecords = (
  args: { criteria: RecordFilter },
  req: Request
) => Promise<Array<Record> | undefined>;

export type DeleteRecord = (
  args: { _id: string },
  req: Request
) => Promise<Record | undefined>;
