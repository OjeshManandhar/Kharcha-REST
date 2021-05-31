// User
export type PasswordISLength = (password: string) => boolean;
export type UsernameISLength = (username: string) => boolean;

// Tag
export type TagIsLength = (tag: string) => boolean;
export type FilterTagsOnLength = (tags: Array<string>) => Array<string>;
