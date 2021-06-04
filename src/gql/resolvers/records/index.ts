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

export const editRecord: T.EditRecord = async (args, req) => {
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
  if (!record._id || !trim(record._id)) {
    errors.push({
      message: '_id is required and cannot be blank',
      field: '_id'
    });
  }

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

    // Find existing record
    const existingRecord = await Record.findById(record._id);

    if (!existingRecord) {
      throw new CustomError('Record not found', 422, [
        {
          message: 'Invalid _id',
          field: '_id'
        }
      ]);
    }

    // Check userId
    if (existingRecord.userId.toString() !== req.userId.toString()) {
      throw new CustomError('Unauthorized', 401);
    }

    // Add changes
    Object.assign(existingRecord, record);

    // Save changes
    const savedRecord = await existingRecord.save();

    if (savedRecord !== existingRecord) {
      throw new CustomError('Could not edit', 500);
    }

    return {
      ...savedRecord.toJSON(),
      _id: savedRecord._id.toString(),
      userId: savedRecord.userId.toString()
    };
  } catch (err) {
    commonErrorHandler(err, 'Failed to edit record');
  }
};

export const deleteRecord: T.DeleteRecord = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const errors: ErrorData = [];

  const _id = trim(args._id);

  // Validation
  if (!_id) {
    errors.push({
      message: '_id is required and cannot be blank',
      field: '_id'
    });
  }

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

    // Find existing record
    const existingRecord = await Record.findById(_id);

    if (!existingRecord) {
      throw new CustomError('Record not found', 422, [
        {
          message: 'Invalid _id',
          field: '_id'
        }
      ]);
    }

    // Check userId
    if (existingRecord.userId.toString() !== req.userId.toString()) {
      throw new CustomError('Unauthorized', 401);
    }

    // Delete record
    const deleted = await Record.deleteOne({ _id });

    if (deleted.deletedCount !== 1) {
      throw new CustomError('Could not delete record', 500);
    }

    return {
      ...existingRecord.toJSON(),
      _id: existingRecord._id.toString(),
      userId: existingRecord.userId.toString()
    };
  } catch (err) {
    commonErrorHandler(err, 'Failed to delete record');
  }
};
