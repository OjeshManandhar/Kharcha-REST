export const types = `
  type userData {
    _id: String!
    username: String!
  }
`;

export const mutations = `
  createUser(
    username: String!
    password: String!
    confirmPassword: String!
  ): userData
`;
