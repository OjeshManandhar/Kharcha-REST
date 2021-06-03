// resolvers
import * as tags from './tags';
import * as users from './users';
import * as records from './records';

const rootResolver = {
  ...users,
  ...tags,
  ...records
};

export default rootResolver;
