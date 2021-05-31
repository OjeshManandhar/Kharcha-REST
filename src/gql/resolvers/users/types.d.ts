export type CreateUserArgs = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type CreateUserRet =
  | undefined
  | {
      _id: string;
      username: string;
      token: string;
    };

export type LoginArgs = {
  username: string;
  password: string;
};

export type LoginRet =
  | undefined
  | {
      token: string;
    };

export type ChangePasswordArgs = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type ChangePasswordRet = undefined | boolean;

export type DeleteUserRet = undefined | boolean;
