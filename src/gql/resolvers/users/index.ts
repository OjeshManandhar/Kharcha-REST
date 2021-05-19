// model
import User from 'models/user';

// utils
import CustomError, { ErrorData } from 'utils/CustomError';

// types
import type * as T from './types';

export async function createUser(
  args: T.createUserArgs
): Promise<T.createUserRet> {
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
  try {
    // Check if use exist
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      throw new CustomError('User already exists', 422, [
        {
          message: 'username already in use',
          field: 'username'
        }
      ]);
    }

    // Create new user
    const newUser = new User({
      username,
      password
    });
    const savedUser = await newUser.save();

    return {
      _id: savedUser._id.toString(),
      username: savedUser.username
    };
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError('User creation failed');
    }
  }
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
