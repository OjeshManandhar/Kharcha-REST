export const queries = `
  listTags: [String!]!

  searchTags(tag: String!): [String!]!
`;

export const mutations = `
  addTags(tags: [String!]!): [String!]!

  editTag(
    oldTag: String! 
    newTag:String!
  ): String!
  
  deleteTags(tags: [String!]!): [String!]!
`;
