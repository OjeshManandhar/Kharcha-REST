// scalars
import DateType from 'gql/scalars/date';

// resolvers
import * as tags from './tags';
import * as users from './users';

const rootResolver = {
  Date: DateType,
  ...users,
  ...tags
};

export default rootResolver;
