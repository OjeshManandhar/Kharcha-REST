// packages
import type { Request } from 'express';

// enum
import { RecordType, TypeCriteria, FilterCriteria } from 'global/enum';

export type Record = {
  _id: string;
  userId: string;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Arrray<string>;
  description: string;
};

export type RecordInput = {
  _id: ?string;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Arrray<string>;
  description: string;
};

export type RecordFilter = {
  idStart: string;
  idEnd: string;
  dateStart: Date;
  dateEnd: Date;
  amountStart: number;
  amountEnd: number;
  type: TypeCriteria;
  tagsType: FilterCriteria;
  tags: Array<string>;
  description: string;
  criteria: FilterCriteria;
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
