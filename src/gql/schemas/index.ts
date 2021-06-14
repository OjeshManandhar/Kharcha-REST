// packages
import { buildSchema } from 'graphql';

// scalars
import DateType from 'gql/scalars/date';

// schemas
import * as tags from './tags';
import * as users from './users';
import * as records from './records';

const schema = buildSchema(`
  scalar Date

  ${users.types}
  ${records.types}

  type RootQuery {
    ${users.queries}
    ${tags.queries}
    ${records.queries}
  }

  type RootMutation {
    ${users.mutations}
    ${tags.mutations}
    ${records.mutations}
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.assign((schema as any)._typeMap.Date, DateType);

export default schema;
