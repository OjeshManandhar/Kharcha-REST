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
  args: T.CreateUserArgs
): Promise<T.CreateUserRet> {
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
      message: 'Confirm Password does not match Password',
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

export async function login(args: T.LoginArgs): Promise<T.AtuhPayload> {
  const errors: ErrorData = [];

  const username = trim(args.username);
  const password = trim(args.password);

  // Validation
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
      throw new CustomError('Log in failed');
    }
  }
}

export async function changePassword(
  args: T.ChangePasswordArgs
): Promise<T.AtuhPayload> {
  const errors: ErrorData = [];

  const oldPassword = trim(args.oldPassword);
  const newPassword = trim(args.newPassword);
  const confirmNewPassword = trim(args.confirmNewPassword);

  // Validation
  if (!isLength(oldPassword, { min: 8 })) {
    errors.push({
      message: 'Old Password must be at least 8 characters',
      field: 'oldPassword'
    });
  }
  if (oldPassword === newPassword) {
    errors.push({
      message: 'New Password cannot be same as Old Password',
      field: 'newPassword'
    });
  }
  if (newPassword !== confirmNewPassword) {
    errors.push({
      message: 'Confirm New Password does not match New Password',
      field: 'confirmNewPassword'
    });
  }
  if (!isLength(newPassword, { min: 8 })) {
    errors.push({
      message: 'New Password must be at least 8 characters',
      field: 'newPassword'
    });
  }
  if (!isLength(confirmNewPassword, { min: 8 })) {
    errors.push({
      message: 'Confirm New Password must be at least 8 characters',
      field: 'confirmNewPassword'
    });
  }

  if (errors.length > 0) {
    throw new CustomError('Invalid Input', 422, errors);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findOne({ username: 'DeadSkull' });

    if (!user) {
      throw new CustomError('User not found', 500);
    }

    // Check old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      throw new CustomError('Incorrect old password', 401);
    }

    // Hash new password
    const hashedPass = await bcrypt.hash(newPassword, 12);

    // Save new password
    user.password = hashedPass;
    await user.save();

    return { token: 'token' };
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError('Failed to change password');
    }
  }
}
