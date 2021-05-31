// packages
import isLength from 'validator/lib/isLength';

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

export const filterTagsOnLength: T.FilterTagsOnLength = tags =>
  tags.filter(tag => !tagIsLength(tag));
