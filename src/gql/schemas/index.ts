// packages
import { buildSchema } from 'graphql';

// schemas
import * as tags from './tags';
import * as users from './users';
import * as records from './records';

export default buildSchema(`
  scalar Date

  ${users.types}
  ${records.types}

  type RootQuery {
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
