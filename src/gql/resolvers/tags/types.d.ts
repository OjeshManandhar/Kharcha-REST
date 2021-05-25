// packages
import type { Request } from 'express';

export type ListTags = (args: unknown, req: Request) => Promist<Array<string>>;

export type SearchTags = (
  args: { tag: string },
  req: Request
) => Promist<Array<string>>;

export type AddTags = (
  args: { tags: Array<string> },
  req: Request
) => Promist<Array<string>>;

export type EditTag = (args: { tag: string }, req: Request) => Promise<string>;

export type DeleteTags = (
  args: { tags: Array<string> },
  req: Request
) => Promist<Array<string>>;
