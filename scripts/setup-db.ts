import { config } from 'dotenv';
import { createIndexes } from '../lib/db/indexes';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function setup() {
  console.log('Setting up database indexes...');
  try {
    await createIndexes();
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup();
