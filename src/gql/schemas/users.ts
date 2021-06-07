export const types = `
  type NewUserData {
    _id: ID!
    username: String!
    token: String!
  }

  type AuthPayload {
    token: String!
  }
`;

export const queries = `
  login(
    username: String!
    password: String!
  ): AuthPayload
`;

export const mutations = `
  createUser(
    username: String!
    password: String!
    confirmPassword: String!
  ): NewUserData

  changePassword(
    oldPassword: String!
    newPassword: String!
    confirmNewPassword: String!
  ): Boolean!

  deleteUser: Boolean!
`;
