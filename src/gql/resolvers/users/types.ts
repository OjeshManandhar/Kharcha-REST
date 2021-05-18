export type createUserArgs = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type createUserRet = {
  _id: string;
  username: string;
};

export type loginArgs = {
  username: string;
  password: string;
};

export type loginRet = {
  token: string;
};
