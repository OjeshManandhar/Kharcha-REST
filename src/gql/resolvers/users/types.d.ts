export type CreateUserArgs = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type CreateUserRet = {
  _id: string;
  username: string;
};

export type AtuhPayload = {
  token: string;
};

export type LoginArgs = {
  username: string;
  password: string;
};

export type ChangePasswordArgs = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
