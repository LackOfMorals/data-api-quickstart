import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_NEO4J_GRAPHQL_URL,
  {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`,
    },
  }
);
