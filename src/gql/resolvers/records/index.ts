// model
import User from 'models/user';

// utils
import CustomError from 'utils/customError';
import commonErrorHandler from 'utils/commonErrorHandler';

// enum
import { RecordType } from './enum';

// types
import type * as T from './types';

export const listRecords: T.ListRecords = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const dummy: T.Record = {
    _id: 'recordId',
    userId: 'userId',
    date: new Date(),
    amount: 123.45,
    type: RecordType.DEBIT,
    tags: [],
    description: 'just a description'
  };

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId, { tags: 1 });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    return [dummy];
  } catch (err) {
    commonErrorHandler(err, 'Failed to list records');
  }
};
