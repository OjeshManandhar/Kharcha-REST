// packages
import type { Mongoose } from 'mongoose';

export type Token = {
  _id?: string;
};

export type RecordInput = {
  _id: ?Mongoose.ObjectId;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Arrray<string>;
  description: string;
};

export type RecordFilter = {
  idStart: ?Mongoose.ObjectId;
  idEnd: ?Mongoose.ObjectId;
  dateStart: ?Date;
  dateEnd: ?Date;
  amountStart: ?number;
  amountEnd: ?number;
  type: TypeCriteria;
  tagsType: FilterCriteria;
  tags: ?Array<string>;
  description: ?string;
  criteria: FilterCriteria;
};
