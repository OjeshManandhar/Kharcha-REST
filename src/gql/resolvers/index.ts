// resolvers
import * as tags from './tags';
import * as users from './users';

function hello(): string {
  return 'Hello World';
}

const rootResolver = {
  hello,
  ...users,
  ...tags
};

export default rootResolver;
