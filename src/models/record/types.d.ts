// global
import { RecordType } from 'global/enum';

// types
import type { Mongoose } from 'mongoose';

export interface IRecord {
  userId: Mongoose.ObjectId;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Array<string>;
  description: string;
}
