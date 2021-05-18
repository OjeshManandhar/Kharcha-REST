export type createUserArgs = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type createUserRet = {
  _id: string;
  username: string;
};
