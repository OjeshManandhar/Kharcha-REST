// packages
import type { Request } from 'express';
import type { Mongoose } from 'mongoose';

// global
import type { Record, RecordInput, RecordFilter } from 'global/types';
import { RecordType, TypeCriteria, FilterCriteria } from 'global/enum';

export type { Record, RecordInput, RecordFilter };

export type GenerateQuery<T> = (
  idStart: ?T,
  idEnd: ?T
) =>
  | T
  | {
      $gte: T;
      $lte: T;
    }
  | { $gte: T }
  | { $lte: T }
  | null;

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
