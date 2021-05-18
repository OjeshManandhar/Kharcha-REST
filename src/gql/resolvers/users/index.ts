// utils
import CustomError, { ErrorData } from 'utils/CustomError';

// types
import type * as T from './types';

export function createUser(args: T.createUserArgs): T.createUserRet {
  const errors: ErrorData = [];
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
    throw new CustomError('Invalid Input', 422, errors);
  }

  // Actual work

  return {
    _id: username + ' ' + password,
    username: username
  };
}

export function login(args: T.loginArgs): T.loginRet {
  const errors: ErrorData = [];
  const { username, password } = args;

  // validation
  if (username.length < 8) {
    errors.push({ message: 'Username too short', field: 'username' });
  }
  if (password.length < 8) {
    errors.push({
      message: 'Password too short',
      field: 'password'
    });
  }

  if (errors.length > 0) {
    throw new CustomError('Invalid Input', 422, errors);
  }

  // Actual work

  if (username === 'DeadSkull' && password === 'password') {
    return {
      token: username + ' ' + password
    };
  }

  throw new CustomError('Incorrect username and password', 401);
}
