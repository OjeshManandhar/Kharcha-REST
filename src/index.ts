// dotenv
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// packages
import express, { Request, Response, NextFunction } from 'express';
import mongoos from 'mongoose';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';

// Middleware
import isAuth from 'middleware/isAuth';

// GraphQL
import schema from 'gql/schemas';
import resolvers from 'gql/resolvers';

// utils
import CustomError from 'utils/customError';

// env
import { PORT, MONGO_DB, MONGO_USER, MONGO_PASS } from 'env_config';

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

// Auth
app.use(isAuth);

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

// Error handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500;
    const message = error.message || 'An error occured';
    const data = error.data || [];

    res.status(status).json({ message: message, status: status, data: data });
  }
);

console.log('Connecting to MonogoDB server');

mongoos
  .connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@kharcha.ueuc7.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server started at port', PORT);
    });
  })
  .catch(err => {
    console.log('Mongoose connection error:', err);
  });
