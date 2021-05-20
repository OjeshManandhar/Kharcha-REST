export type CreateUserArgs = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type CreateUserRet = {
  _id: string;
  username: string;
};

export type LoginArgs = {
  username: string;
  password: string;
};

export type LoginRet = {
  token: string;
};

export type ChangePasswordArgs = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type ChangePasswordRet = boolean;

export type DeleteUserRet = boolean;
