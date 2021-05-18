export const types = `
  type userData {
    _id: String!
    username: String!
  }

  type authData {
    token: String!
  }
`;

export const mutations = `
  createUser(
    username: String!
    password: String!
    confirmPassword: String!
  ): userData

  login(
    username: String!
    password: String!
  ): authData
`;
