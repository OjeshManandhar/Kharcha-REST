// global
import type { RecordInput, RecordFilter } from 'global/types';

// utils
import type { ErrorData } from 'utils/customError';

// User
export type PasswordISLength = (password: string) => boolean;
export type UsernameISLength = (username: string) => boolean;

// Tag
export type TagIsLength = (tag: string) => boolean;
export type FilterTagsOnLength = (tags: Array<string>) => Array<string>;

// Record
export type ValidateRecordInput = (
  record: RecordInput,
  errors: ErrorData
) => void;
