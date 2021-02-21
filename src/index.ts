import graphql from './graphql/server';
import http from './http';

const { GRAPHQL_PORT, HTTP_PORT } = process.env;
graphql.start(
  {
    port: parseInt(GRAPHQL_PORT),
    endpoint: '/',
    playground:
      process.env.NODE_ENV === 'development' ? '/' : false,
  },
  () => console.log(`Listening GraphQL on ${GRAPHQL_PORT}`)
);
http.listen(parseInt(HTTP_PORT), () => {
  console.log(`Listening Http api on ${HTTP_PORT}`);
});
