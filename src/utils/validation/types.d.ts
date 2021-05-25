// User
export type PasswordISLength = (password: string) => boolean;
export type UsernameISLength = (username: string) => boolean;

// Tag
export type FilterTagsOnLengths = (tags: Array<string>) => Array<string>;
