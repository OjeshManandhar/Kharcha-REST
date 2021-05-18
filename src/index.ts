// packages
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';

// GraphQL
import schema from 'graphql/schema';
import * as resolvers from 'graphql/resolver';

const app = express();

// Request parser
app.use(bodyParser.json());

// CORS headers
app.use((undefined, res, next) => {
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
    graphiql: true
  })
);

app.use('/', (req, res) => {
  console.log('req.url:', req.url);
  console.log('req.body:', req.body);

  res.send('Hello world!');
});

app.listen(5000, () => {
  console.log('Server started at port 5000');
});
