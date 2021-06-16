// packages
import type { Request } from 'express';

export type AddTags = (
  args: { tags: Array<string> },
  req: Request
) => Promise<Array<string> | undefined>;

export type ListTags = (
  args: unknown,
  req: Request
) => Promise<Array<string> | undeinfed>;

export type SearchTags = (
  args: { tag: string },
  req: Request
) => Promise<Array<string> | undefined>;

export type EditTag = (
  args: { oldTag: string; newTag: string },
  req: Request
) => Promise<string | undefined>;

export type DeleteTags = (
  args: { tags: Array<string> },
  req: Request
) => Promise<Array<string> | undefined>;
