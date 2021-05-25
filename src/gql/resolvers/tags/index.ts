// packages
import trim from 'validator/lib/trim';

// model
import User from 'models/user';

// utils
import { filterTagsOnLengths } from 'utils/validation';
import CustomError, { ErrorData } from 'utils/customError';

// types
import type * as T from './types';

export const listTags: T.ListTags = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  // Actual work
  try {
    const user = await User.findById(req.userId, { tags: 1 });

    if (!user) {
      throw new CustomError('User not found', 500);
    }

    return user.tags;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError('Failed to list tags');
    }
  }
};

export const searchTags: T.SearchTags = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const errors: ErrorData = [];

  const tag = trim(args.tag);

  // Validation
  if (tag.length === 0) {
    errors.push({
      message: 'Empty tag given',
      field: 'tag'
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
      throw new CustomError('User not found', 500);
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

    console.log('found tags:', foundTags);

    if (foundTags.length === 0) {
      return [];
    }
    return foundTags[0].tags;
    */
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError('Failed to search tags');
    }
  }
};

export const addTags: T.AddTags = async (args, req) => {
  // Auth
  if (!req.isAuth || !req.userId) {
    throw new CustomError('Unauthorized. Log in first', 401);
  }

  const trimmedTags = args.tags.map(tag => trim(tag));

  // Validation
  const tags = filterTagsOnLengths(trimmedTags);

  if (tags.length === 0) {
    throw new CustomError('No valid tags', 422, [
      {
        message: 'No valid tags',
        field: 'tags'
      }
    ]);
  }

  // Actual work
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new CustomError('User not found', 500);
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
      throw new CustomError('Could not update', 500);
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
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError('Failed to add tags');
    }
  }
};
