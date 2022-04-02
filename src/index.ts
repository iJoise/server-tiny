import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers} from './graphgl'
import dotenv from 'dotenv';
import { connectDatabase } from './database';

dotenv.config();
const app = express();
const port = 5000;

const mount = async (app: Application) => {
  const db = await connectDatabase();

  const apolloServer = new ApolloServer({ typeDefs, resolvers, context: () => ({ db }) });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/api' });

  app.listen(port);

  console.log(`[app]: http://localhost:${port}`);

  const listings = await  db.listings.find({}).toArray();
  console.log(listings);
}

mount(express())
