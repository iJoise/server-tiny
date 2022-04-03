import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphgl';
import dotenv from 'dotenv';
import { connectDatabase } from './database';

dotenv.config();
const PORT = process.env.PORT || 5000;

const mount = async (app: Application) => {
  const db = await connectDatabase();

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ db }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/api' });

  app.listen(PORT);
};

mount(express()).then(() => console.log(`[app]: http://localhost:${PORT}`));
