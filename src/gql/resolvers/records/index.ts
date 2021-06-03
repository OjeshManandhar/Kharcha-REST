// model
import User from 'models/user';
// import Record from 'models/record';

// global
import { RecordType } from 'global/enum';

// utils
import CustomError from 'utils/customError';
import commonErrorHandler from 'utils/commonErrorHandler';

// types
import type * as T from './types';

export const createRecord: T.CreateRecord = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const record = args.record;

  const dummy: T.Record = {
    ...record,
    _id: 'recordId',
    userId: req.userId.toString()
  };

  console.log('dummy:', dummy);

  try {
    return dummy;
  } catch (err) {
    commonErrorHandler(err, 'Failed to create record');
  }
};

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
