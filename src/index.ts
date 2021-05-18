// dotenv
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// packages
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';

// GraphQL
import schema from 'gql/schemas';
import resolvers from 'gql/resolvers';

// utils
import CustomError from 'utils/CustomError';

// env
import { PORT } from 'env_config';

const app = express();

// Request parser
app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
    customFormatErrorFn: err => {
      if (!err.originalError) {
        return err;
      }

      const { data, status, message } = err.originalError as CustomError;

      return { message, status, data };
    }
  })
);

app.use('/', (req, res) => {
  console.log('req.url:', req.url);
  console.log('req.body:', req.body);

  res.send('Hello world!');
});

app.listen(PORT, () => {
  console.log('Server started at port', PORT);
});
