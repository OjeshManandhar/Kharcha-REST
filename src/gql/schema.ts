import { buildSchema } from 'graphql';

export default buildSchema(`
  type userData {
    email: String!,
    name: String!
  }

  type RootMutation {
    createUser(email: String!, name: String!, password: String!): userData
  }

  type RootQuery {
    hello: String!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
