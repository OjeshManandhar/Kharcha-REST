// packages
import { buildSchema } from 'graphql';

// schemas
import * as tags from './tags';
import * as users from './users';

export default buildSchema(`
  ${users.types}

  type RootMutation {
    ${users.mutations}
    ${tags.mutations}
  }

  type RootQuery {
    hello: String!
    ${tags.queries}
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
