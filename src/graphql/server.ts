import { applyMiddleware } from 'graphql-middleware';
import { GraphQLServer } from 'graphql-yoga';
import context from './context';
import { schema } from './schema';
import permissions from './shield';

// Using "middlewares" property of graphql-yoga makes error
export default new GraphQLServer({
  schema: applyMiddleware(schema, permissions),
  context,
});
