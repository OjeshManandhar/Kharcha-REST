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
export const filterTagsOnLengths: T.FilterTagsOnLengths = tags =>
  tags.filter(tag => isLength(tag, { min: 3, max: 20 }));
