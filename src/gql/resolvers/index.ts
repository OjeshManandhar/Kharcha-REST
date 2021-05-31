// resolvers
import * as tags from './tags';
import * as users from './users';

const rootResolver = {
  ...users,
  ...tags
};

export default rootResolver;
