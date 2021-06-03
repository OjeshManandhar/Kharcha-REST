// packages
import type { Request } from 'express';

// global
import type { RecordInput, RecordFilter } from 'global/types';
import { RecordType, TypeCriteria, FilterCriteria } from 'global/enum';

export type { RecordInput, RecordFilter };

export type Record = {
  _id: string;
  userId: string;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Arrray<string>;
  description: string;
};

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
) => Promise<Array<Record>>;

export type DeleteRecord = (
  args: { _id: string },
  req: Request
) => Promise<Record | undefined>;
