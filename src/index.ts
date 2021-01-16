import graphql from './graphql/server';
import http from './http';

const { GRAPHQL_PORT, HTTP_PORT } = process.env;
graphql.start({ port: GRAPHQL_PORT, endpoint: '/' }, () =>
  console.log(`Listening GraphQL on ${GRAPHQL_PORT}`)
);
http.listen(HTTP_PORT, () => {
  console.log(`Listening Http api on ${HTTP_PORT}`);
});
