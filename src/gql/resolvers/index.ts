// resolvers
import * as users from './users';

function hello(): string {
  return 'Hello World';
}

const rootResolver = {
  hello,
  ...users
};

console.log('rootResolvers:', rootResolver);

export default rootResolver;
