// packages
import mongoose from 'mongoose';
import trim from 'validator/lib/trim';

// model
import User from 'models/user';
import Record from 'models/record';

// global
import { TypeCriteria, FilterCriteria } from 'global/enum';

// utils
import generateQuery from 'utils/generateQuery';
import commonErrorHandler from 'utils/commonErrorHandler';
import CustomError, { ErrorData } from 'utils/customError';
import {
  validateRecordInput,
  validateRecordFilter,
  filterUniqueValidTags
} from 'utils/validation';

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
      tags: record.tags
        .filter((tag: string) =>
          user.tags.find(t => t.toLowerCase() === tag.toLowerCase())
        )
        .map((tag: string) =>
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

    const foundRecords = await Record.find({ userId: req.userId }).sort({
      _id: -1
    });

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

    // find valid tags
    const validTags: Array<string> = [];
    record.tags.forEach((tag: string) => {
      const foundTag = user.tags.find(
        t => t.toLowerCase() === tag.toLowerCase()
      );

      // if (foundTag) validTags.push(foundTag);
      foundTag && validTags.push(foundTag);
    });

    record.tags = [...validTags];
    record.description = trim(record.description);

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

export const filterRecords: T.FilterRecords = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const errors: ErrorData = [],
    queryErrors: ErrorData = [];

  const criteria = {
    ...args.criteria,
    type: args.criteria.type || TypeCriteria.ANY,
    tagsType: args.criteria.tagsType || FilterCriteria.ANY,
    tags: args.criteria.tags ? filterUniqueValidTags(args.criteria.tags) : [],
    filterCriteria: args.criteria.filterCriteria || FilterCriteria.ANY
  };

  // Validation
  errors.push(...validateRecordFilter(criteria));

  if (errors.length > 0) {
    throw new CustomError('Invalid Input', 422, errors);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId, { tags: 1 });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    /**
     * for ALL criteria
     * -  simply use $and
     *
     * for ANY criteria
     * -  As $text wont work with $or unless all entries of $or are indexed
     * -  So resA = $or of all criteria except description
     * -  resB = $text for description
     * -  find resA U resB using _id as PK
     */

    const filterdRecords: Array<T.Record> = [];

    const {
      idStart,
      idEnd,
      dateStart,
      dateEnd,
      amountStart,
      amountEnd,
      type,
      tags,
      tagsType,
      description
    } = criteria;

    // eslint-disable-next-line @typescript-eslint/ban-types
    const queryList: Array<object> = [];

    // _id
    const idQuery = generateQuery(
      idStart ? mongoose.Types.ObjectId(idStart) : null,
      idEnd ? mongoose.Types.ObjectId(idEnd) : null
    );
    if (idQuery) {
      queryList.push({ _id: idQuery });
    }

    // _date
    const dateQuery = generateQuery(dateStart, dateEnd);
    if (dateQuery) {
      queryList.push({ date: dateQuery });
    }

    // amount
    const amountQuery = generateQuery(amountStart, amountEnd);
    if (amountQuery) {
      queryList.push({ amount: amountQuery });
    }

    // type
    if (type !== TypeCriteria.ANY) {
      queryList.push({ type });
    }

    // tags
    if (tags.length > 0) {
      // tags that are present in User
      const validTags: Array<string> = [];

      tags.forEach((tag: string) => {
        const foundTag = user.tags.find(
          t => t.toLowerCase() === tag.toLowerCase()
        );

        // if (foundTag) validTags.push(foundTag);
        foundTag && validTags.push(foundTag);
      });

      if (validTags.length !== 0) {
        if (tagsType === FilterCriteria.ALL) {
          queryList.push({ tags: { $all: validTags } });
        } else if (tagsType === FilterCriteria.ANY) {
          queryList.push({ tags: { $in: validTags } });
        }
      } else {
        queryErrors.push({
          message: 'No valid tags',
          field: 'tags'
        });
      }
    }

    if (queryList.length === 0 && !description) {
      queryErrors.push({
        message: 'Enter at least one valid criteria'
      });

      throw new CustomError('Invalid Input', 422, queryErrors);
    }

    if (criteria.filterCriteria === FilterCriteria.ALL) {
      if (description) {
        queryList.push({
          $text: { $search: description, $caseSensitive: false }
        });
      }

      const foundRecords = await Record.find({
        userId: req.userId,
        $and: queryList
      }).sort({ _id: -1 });

      filterdRecords.push(
        ...foundRecords.map(r => {
          const rec = r.toJSON();

          return {
            ...rec,
            _id: rec._id.toString(),
            userId: rec.userId.toString()
          };
        })
      );
    } else if (criteria.filterCriteria === FilterCriteria.ANY) {
      // find records with any criteria except description
      if (queryList.length > 0) {
        const foundWithoutDesc = await Record.find({
          userId: req.userId,
          $or: queryList
        }).sort({ _id: -1 });

        const tempWithoutDesc: Array<T.Record> = foundWithoutDesc.map(r => {
          const rec = r.toJSON();

          return {
            ...rec,
            _id: rec._id.toString(),
            userId: rec.userId.toString()
          };
        });

        filterdRecords.push(...tempWithoutDesc);
      }

      if (description) {
        // records with only description description
        const foundWithDesc = await Record.find({
          userId: req.userId,
          $text: { $search: description, $caseSensitive: false }
        }).sort({ _id: -1 });

        const tempWithDesc: Array<T.Record> = foundWithDesc.map(r => {
          const rec = r.toJSON();

          return {
            ...rec,
            _id: rec._id.toString(),
            userId: rec.userId.toString()
          };
        });

        // find union
        tempWithDesc.forEach(rec => {
          if (
            !filterdRecords.find(r => r._id.toString() === rec._id.toString())
          ) {
            filterdRecords.push(rec);
          }
        });
      }
    }

    return filterdRecords;
  } catch (err) {
    commonErrorHandler(err, 'Failed to filter records');
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
