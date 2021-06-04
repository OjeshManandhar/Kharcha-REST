export const types = `
  enum RecordType {
    DEBIT
    CREDIT
  }

  enum TypeCriteria {
    ANY
    DEBIT
    CREDIT
  }

  enum FilterCriteria {
    ALL
    ANY
  }

  type Record {
    _id: ID!
    userId: ID!
    date: Date!
    amount: Float!
    type: RecordType!
    tags: [String!]!
    description: String!
  }

  input RecordInput {
    _id: ID
    date: Date!
    amount: Float!
    type: RecordType!
    tags: [String!]!
    description: String!
  }

  input RecordFilter {
    idStart: ID
    idEnd: ID
    dateStart: Date
    dateEnd: Date
    amountStart: Float
    amountEnd: Float
    type: TypeCriteria!
    tagsType: FilterCriteria!
    tags: [String!]!
    description: String
    criteria: FilterCriteria!
  }
`;

export const queries = `
  listRecords: [Record!]!

  filterRecords(criteria: RecordFilter!): [Record!]!
`;

export const mutations = `
  createRecord(record: RecordInput!): Record!

  editRecord(record: RecordInput!): Record!

  deleteRecord(_id: ID!): Record!
`;
