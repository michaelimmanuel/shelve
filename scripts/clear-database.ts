import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function clearDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  let client: MongoClient | null = null;

  try {
    console.log('Connecting to database...');
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('booktracker');
    const collection = db.collection('books');

    console.log('Deleting all books...');
    const result = await collection.deleteMany({});

    console.log(`✅ Successfully deleted ${result.deletedCount} books from the database.`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed.');
    }
    process.exit(0);
  }
}

clearDatabase();
