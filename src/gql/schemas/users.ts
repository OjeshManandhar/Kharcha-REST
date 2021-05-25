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

export const mutations = `
  createUser(
    username: String!
    password: String!
    confirmPassword: String!
  ): NewUserData

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
