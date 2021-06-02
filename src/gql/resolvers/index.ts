// scalars
import DateType from 'gql/scalars/date';

// resolvers
import * as tags from './tags';
import * as users from './users';
import * as records from './records';

const rootResolver = {
  Date: DateType,
  ...users,
  ...tags,
  ...records
};

export default rootResolver;
