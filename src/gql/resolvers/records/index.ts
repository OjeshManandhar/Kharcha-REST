// packages
import trim from 'validator/lib/trim';

// model
import User from 'models/user';
import Record from 'models/record';

// utils
import commonErrorHandler from 'utils/commonErrorHandler';
import CustomError, { ErrorData } from 'utils/customError';
import { validateRecordInput, filterUniqueValidTags } from 'utils/validation';

// types
import type * as T from './types';

export const createRecord: T.CreateRecord = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const errors: ErrorData = [];

  const record = {
    ...args.record,
    tags: filterUniqueValidTags(args.record.tags)
  };

  // Validation
  errors.push(...validateRecordInput(record));

  if (errors.length > 0) {
    throw new CustomError('Invalid Input', 422, errors);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Create new record
    const newRecord = new Record({
      ...args.record,
      // Add userId
      userId: req.userId.toString(),
      // Filter out existing tags
      tags: record.tags.filter((tag: string) =>
        user.tags.find(t => t.toLowerCase() === tag.toLowerCase())
      ),
      description: trim(record.description)
    });
    const savedRecord = await newRecord.save();

    if (savedRecord !== newRecord) {
      throw new CustomError('Could not create', 500);
    }

    return {
      ...savedRecord.toJSON(),
      _id: savedRecord._id.toString(),
      userId: savedRecord.userId.toString()
    };
  } catch (err) {
    commonErrorHandler(err, 'Failed to create record');
  }
};

export const listRecords: T.ListRecords = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId, { tags: 1 });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    const foundRecords = await Record.find({ userId: req.userId });

    return foundRecords.map(rec => {
      const json = rec.toJSON();

      return {
        ...json,
        _id: json._id.toString(),
        userId: json.userId.toString()
      };
    });
  } catch (err) {
    commonErrorHandler(err, 'Failed to list records');
  }
};
