// packages
import trim from 'validator/lib/trim';

// model
import User from 'models/user';

// utils
import commonErrorHandler from 'utils/commonErrorHandler';
import CustomError, { ErrorData } from 'utils/customError';
import { tagIsLength, filterUniqueValidTags } from 'utils/validation';

// types
import type * as T from './types';

export const addTags: T.AddTags = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  // Validation
  const tags = filterUniqueValidTags(args.tags);

  if (tags.length === 0) {
    throw new CustomError('Invalid Input', 422, [
      {
        message: 'No valid tags',
        field: 'tags'
      }
    ]);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Filter out already existing tags
    const tagsToAdd = tags.filter(
      tag => !user.tags.find(t => t.toLowerCase() === tag.toLowerCase())
    );

    if (tagsToAdd.length === 0) return [];

    // Add new tags
    user.tags.push(...tagsToAdd);

    // Save the doc
    const savedUser = await user.save();

    if (savedUser !== user) {
      throw new CustomError('Could not update');
    }

    return tagsToAdd;

    // Will work but wont be able to return the saved tags
    // await User.updateOne(
    //   { _id: req.userId },
    //   {
    //     $addToSet: {
    //       tags: {
    //         $each: tags
    //       }
    //     }
    //   }
    // );
  } catch (err) {
    commonErrorHandler(err, 'Failed to add tags');
  }
};

export const listTags: T.ListTags = async (args, req) => {
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

    return user.tags;
  } catch (err) {
    commonErrorHandler(err, 'Failed to list tags');
  }
};

export const searchTags: T.SearchTags = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const tag = trim(args.tag);

  // Validation
  if (tag.length === 0) {
    throw new CustomError('Invalid Input', 422, [
      {
        message: 'Empty tag given',
        field: 'tag'
      }
    ]);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    const regex = new RegExp(tag, 'i');

    return user.tags.filter(tag => regex.test(tag));

    /*
    // Find user and tags
    const foundTags = (await User.aggregate([
      { $match: { _id: req.userId } },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: tag, $options: 'i' } } },
      { $group: { _id: '$_id', tags: { $push: '$tags' } } }
    ])) as Array<{ tags: Array<string> }>;

    if (foundTags.length === 0) {
      return [];
    }
    return foundTags[0].tags;
    */
  } catch (err) {
    commonErrorHandler(err, 'Failed to search tags');
  }
};

export const editTag: T.EditTag = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const errors: ErrorData = [];

  const oldTag = trim(args.oldTag);
  const newTag = trim(args.newTag);

  // Validation
  if (tagIsLength(oldTag)) {
    errors.push({
      message: 'Old tag must be of length 3 to 20 characters',
      field: 'oldTag'
    });
  }
  if (tagIsLength(newTag)) {
    errors.push({
      message: 'New tag must be of length 3 to 20 characters',
      field: 'newTag'
    });
  }
  if (oldTag === newTag) {
    errors.push({
      message: "New tag can't be same as Old tag",
      field: 'newTag'
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

    // Check for old tag
    const tagIndex = user.tags.findIndex(t => t === oldTag);

    if (tagIndex === -1) {
      throw new CustomError('Invalid Input', 422, [
        {
          message: "Old tag doesn't exist",
          field: 'oldTag'
        }
      ]);
    }

    // Check if new tag already exits
    // Will not
    const newTagExists = user.tags.find(
      t => t !== oldTag && t.toLowerCase() === newTag.toLowerCase()
    );

    if (newTagExists) {
      throw new CustomError('Invalid Input', 422, [
        {
          message: 'New tag already exist',
          field: 'newTag'
        }
      ]);
    }

    user.tags.splice(tagIndex, 1, newTag);

    const savedUser = await user.save();

    if (savedUser !== user) {
      throw new CustomError('Could not update');
    }

    return newTag;
  } catch (err) {
    commonErrorHandler(err, 'Failed to edit tag');
  }
};

export const deleteTags: T.DeleteTags = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  // Validation
  const tags = filterUniqueValidTags(args.tags);

  if (tags.length === 0) {
    throw new CustomError('Invalid Input', 422, [
      {
        message: 'No valid tags',
        field: 'tags'
      }
    ]);
  }

  // Actual work
  try {
    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Filter out not existing tags
    const tagsToDelete = tags.filter(tag => user.tags.includes(tag));

    if (tagsToDelete.length === 0) return [];

    // Remove tags
    user.tags = user.tags.filter(tag => !tagsToDelete.find(t => t === tag));

    // Save the doc
    const savedUser = await user.save();

    if (savedUser !== user) {
      throw new CustomError('Could not update');
    }

    return tagsToDelete;
  } catch (err) {
    commonErrorHandler(err, 'Failed to delete tags');
  }
};
