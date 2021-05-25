export const queries = `
  listTags: [String!]!
  searchTags(tag: String!): [String!]!
`;

export const mutations = `
  addTags(tags: [String!]!): [String!]!
  editTag(tag: String!): String!
  deleteTag(tag: String!): String!
`;
