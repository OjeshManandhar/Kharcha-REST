export type ListTags = Array<string>;

export type SearchTags = (tag: string) => Array<string>;

export type AddTags = (tags: Array<string>) => Array<string>;

export type EditTag = (tag: string) => string;

export type DeleteTags = (tags: Array<string>) => Array<string>;
