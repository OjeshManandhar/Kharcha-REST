// types
import type * as T from './types';

export function createUser(args: T.createUserArgs): T.createUserRet {
  return {
    _id: 'dummy id',
    username: args.username
  };
}
