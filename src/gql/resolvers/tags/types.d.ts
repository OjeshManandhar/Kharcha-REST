// packages
import type { Request } from 'express';

export type AddTags = (
  args: { tags: Array<string> },
  req: Request
) => Promist<Array<string>>;

export type ListTags = (args: unknown, req: Request) => Promist<Array<string>>;

export type SearchTags = (
  args: { tag: string },
  req: Request
) => Promist<Array<string>>;

export type EditTag = (
  args: { oldTag: string; newTag: string },
  req: Request
) => Promise<string | undefined>;

export type DeleteTags = (
  args: { tags: Array<string> },
  req: Request
) => Promist<Array<string>>;
