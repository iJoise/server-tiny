import { MongoClient } from 'mongodb';
import { Database } from '../lib/types';

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(process.env.DB_URL || '');

  const db = client.db('tiny-house');

  return {
    listings: db.collection('tiny-house'),
  };
};
