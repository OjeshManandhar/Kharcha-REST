// resolvers
import * as users from './users';

function hello(): string {
  return 'Hello World';
}

const rootResolver = {
  hello,
  ...users
};

export default rootResolver;
