import { MongoClient } from 'mongodb';

export const connectDatabase = async () => {
  const client = await MongoClient.connect(process.env.DB_URL || '');

  const db = client.db('tiny-house');

  return {
    listings: db.collection('tiny-house'),
  };
};
