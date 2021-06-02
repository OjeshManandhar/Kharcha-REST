// packages
import { GraphQLScalarType } from 'graphql';

/**
 * serialize
 *  convert it from a JavaScript Date object into an ISO-8601 string
 *  when writing a reponse.
 *
 * parseValue
 *  when reading from req
 *  where it will be ISO-8601 string and convert to JS Date object
 *
 * parseLiteral
 *  same as parseValue but receivs AST instead
 */

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date',
  serialize: value => value.toISOString(),
  parseValue: value => new Date(value),
  parseLiteral: (ast: any) => new Date(ast.value)
});

export default DateType;
