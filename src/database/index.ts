import { MongoClient } from 'mongodb';
import { Database, User, Listing, Booking } from '../lib/types';

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(process.env.DB_URL || '', {
    useUnifiedTopology: true
  });

  const db = client.db('tiny-house');

  return {
    bookings: db.collection<Booking>('bookings'),
    listings: db.collection<Listing>('listings'),
    users: db.collection<User>('users'),
  };
};
