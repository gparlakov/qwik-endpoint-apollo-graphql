import { ApolloServer } from '@apollo/server';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

// @ts-expect-error
import typeDefsFile from './schema.graphql';

import { readFileSync } from 'fs';

const typeDefs = readFileSync(`./${typeDefsFile}`).toString();

const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
    },
  ];


// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        books: () => books,
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
export const server = new ApolloServer({
    typeDefs,
    resolvers,
});

export const serverStarted = server.start();

