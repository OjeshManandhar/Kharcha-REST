// types
import type * as T from './types';

export function createUser(args: T.createUserArgs): T.createUserRet {
  const errors: Array<{ message: string; field: string }> = [];
  const { username, password, confirmPassword } = args;

  // Validation
  if (username.length < 8) {
    errors.push({ message: 'Username too short', field: 'username' });
  }
  if (password !== confirmPassword) {
    errors.push({
      message: 'Password and Confirm Password does not match',
      field: 'confirmPassword'
    });
  }
  if (password.length < 8) {
    errors.push({
      message: 'Password too short',
      field: 'password'
    });
  }
  if (confirmPassword.length < 8) {
    errors.push({
      message: 'Confirm Password too short',
      field: 'confirmPassword'
    });
  }

  if (errors.length > 0) {
    const err = {
      status: 422,
      data: errors,
      message: 'Invalid Input'
    };

    throw new Error(JSON.stringify(err));
  }

  return {
    _id: username + ' ' + password,
    username: username
  };
}
