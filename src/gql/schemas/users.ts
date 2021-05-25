export const types = `
  type UserData {
    _id: ID!
    username: String!
  }

  type AuthPayload {
    token: String!
  }
`;

export const mutations = `
  createUser(
    username: String!
    password: String!
    confirmPassword: String!
  ): UserData

  login(
    username: String!
    password: String!
  ): AuthPayload

  changePassword(
    oldPassword: String!
    newPassword: String!
    confirmNewPassword: String!
  ): Boolean!

  deleteUser: Boolean!
`;
