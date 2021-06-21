// enum
import { RecordType, TypeCriteria, FilterCriteria } from './enum';

export type Token = {
  _id?: string;
};

// _id is not Mongoose.ObjectID in Record*
// because it will ne sent and received as string

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
  _id: string | null | undefined;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Arrray<string>;
  description: string;
};

export type RecordFilter = {
  idStart: ?string;
  idEnd: ?string;
  dateStart: ?Date;
  dateEnd: ?Date;
  amountStart: ?number;
  amountEnd: ?number;
  type: ?TypeCriteria;
  tagsType: ?FilterCriteria;
  tags: ?Array<string>;
  description: ?string;
  filterCriteria: ?FilterCriteria;
};
