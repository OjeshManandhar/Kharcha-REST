import { buildSchema } from 'graphql';

export default buildSchema(`
  type userData {
    _id: String!,
    username: String!
  }

  type RootMutation {
    createUser(
      username: String!, 
      password: String!,
      confirmPassword: String!
    ): userData
  }

  type RootQuery {
    hello: String!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
