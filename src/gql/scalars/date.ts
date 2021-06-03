// packages
import { Kind, GraphQLScalarType } from 'graphql';

// utils
import CustomError from 'utils/customError';

/**
 * serialize
 *  convert it from a JavaScript Date object into an ISO-8601 string
 *  when writing a reponse
 *  value sent to clients
 *
 * parseValue
 *  when reading from req
 *  where it will be ISO-8601 string and convert to JS Date object
 *  value from the client input variables
 *
 * parseLiteral
 *  same as parseValue but receivs AST instead
 */

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date type. Value is string in form "YYYY-MM-DD" or ISO-8601',
  serialize(value: unknown): string {
    if (!(value instanceof Date)) {
      throw new CustomError('Date can only serialize Date values', 422);
    }
    return value.toISOString();
  },
  parseValue(value: unknown): Date {
    if (typeof value !== 'string') {
      throw new CustomError('Date can only parse string values', 422);
    }
    return new Date(value);
  },
  parseLiteral(ast): Date {
    if (ast.kind !== Kind.STRING) {
      throw new CustomError('Date can only parse string values', 422);
    }
    return new Date(ast.value);
  }
});

export default DateType;
