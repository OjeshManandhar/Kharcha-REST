// global
import { RecordType } from 'global/enum';

export interface IRecord {
  userId: string;
  date: Date;
  amount: number;
  type: RecordType;
  tags: Array<string>;
  description: string;
}
