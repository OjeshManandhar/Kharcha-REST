export type Token = {
  _id?: string;
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
