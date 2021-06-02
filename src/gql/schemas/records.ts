export const types = `
  enum Type {
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
    date: Date!
    amount: Float!
    type: Type!
    tags: [String!]!
    description: String!
  }

  type RecordInput {
    date: Date!
    amount: Float!
    type: Type!
    tags: [String!]!
    description: String!
  }

  type RecordFilter {
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
`;

export const mutations = `
  createRecord(record: RecordInput!): Record!

  editRecord(record: Record!): Record!

  filterRecords(criteria: RecordFilter!): [Record!]!

  deleteRecord(_id: ID!): Record!
`;
