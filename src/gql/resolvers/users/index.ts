// packages
import bcrypt from 'bcryptjs';
import trim from 'validator/lib/trim';
import isLength from 'validator/lib/isLength';

// model
import User from 'models/user';

// utils
import CustomError, { ErrorData } from 'utils/customError';

// types
import type * as T from './types';

export async function createUser(
  args: T.createUserArgs
): Promise<T.createUserRet> {
  const errors: ErrorData = [];

  const username = trim(args.username);
  const password = trim(args.password);
  const confirmPassword = trim(args.confirmPassword);

  // Validation
  if (!isLength(username, { min: 4, max: 15 })) {
    errors.push({
      message: 'Username must of length 4 to 15 characters',
      field: 'username'
    });
  }
  if (password !== confirmPassword) {
    errors.push({
      message: 'Password and Confirm Password does not match',
      field: 'confirmPassword'
    });
  }
  if (!isLength(password, { min: 8 })) {
    errors.push({
      message: 'Password must be at least 8 characters',
      field: 'password'
    });
  }
  if (!isLength(confirmPassword, { min: 8 })) {
    errors.push({
      message: 'Confirm Password must be at least 8 characters',
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

    // hash password
    const hashedPass = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPass
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

export async function login(args: T.loginArgs): Promise<T.loginRet> {
  const errors: ErrorData = [];

  const username = trim(args.username);
  const password = trim(args.password);

  // validation
  if (!isLength(username, { min: 4, max: 15 })) {
    errors.push({
      message: 'Username must of length 4 to 15 characters',
      field: 'username'
    });
  }
  if (!isLength(password, { min: 8 })) {
    errors.push({
      message: 'Password must be at least 8 characters',
      field: 'password'
    });
  }

  if (errors.length > 0) {
    throw new CustomError('Invalid Input', 422, errors);
  }

  // Actual work
  try {
    // Find user
    const existingUser = await User.findOne({ username: username });

    if (!existingUser) {
      throw new CustomError('Incorrect username or password', 401);
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      throw new CustomError('Incorrect username or password', 401);
    }
    return { token: 'token' };
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError('User creation failed');
    }
  }
}
