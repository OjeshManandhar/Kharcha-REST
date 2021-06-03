// packages
import trim from 'validator/lib/trim';
import isBefore from 'validator/lib/isBefore';
import isLength from 'validator/lib/isLength';

// globals
import { RecordType } from 'global/enum';

// types
import * as T from './types';

// User
export const passwordIsLength: T.PasswordISLength = password =>
  !isLength(password, { min: 8 });

export const usernameIsLength: T.UsernameISLength = username =>
  !isLength(username, { min: 4, max: 15 });

// Tags
export const tagIsLength: T.TagIsLength = tag =>
  !isLength(tag, { min: 3, max: 20 });

export const trimTags: T.TrimTags = tags => tags.map(t => trim(t));

export const filterTagsOnLength: T.FilterTagsOnLength = tags =>
  tags.filter(tag => !tagIsLength(tag));

export const filterDuplicateTags: T.FilterDuplicateTags = tags => {
  const filteredTags: Array<string> = [];

  tags.forEach(tag => {
    if (!filteredTags.find(t => t.toLowerCase() === tag.toLocaleLowerCase())) {
      filteredTags.push(tag);
    }
  });

  return filteredTags;
};

export const filterUniqueValidTags: T.FilterUniqueValidTags = tags => {
  const trimmedTags = trimTags(tags);
  const tagsWithValidLen = filterTagsOnLength(trimmedTags);
  const removedDuplicates = filterDuplicateTags(tagsWithValidLen);

  return removedDuplicates;
};

// Records
export const validateRecordInput: T.ValidateRecordInput = (record, errors) => {
  const { date, amount, type } = record;

  if (!isBefore(date.toISOString())) {
    errors.push({
      message: 'date must be at today or before today',
      field: 'date'
    });
  }
  if (amount <= 0) {
    errors.push({
      message: 'amount must be greater than 0',
      field: 'amount'
    });
  }
  if (type !== RecordType.DEBIT && type !== RecordType.CREDIT) {
    errors.push({
      message: `type must be either ${RecordType.DEBIT} or ${RecordType.CREDIT}`,
      field: 'type'
    });
  }
};
