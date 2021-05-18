// packages
import { buildSchema } from 'graphql';

// schemas
import * as users from './users';

export default buildSchema(`
  ${users.types}

  type RootMutation {
    ${users.mutations}
  }

  type RootQuery {
    hello: String!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
