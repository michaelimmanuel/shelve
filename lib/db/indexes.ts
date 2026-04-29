import { getDatabase } from './mongodb';

export async function createIndexes() {
  const db = await getDatabase();
  const books = db.collection('books');

  try {
    // Text index for full-text search on title, author, and notes
    await books.createIndex(
      { title: 'text', author: 'text', notes: 'text' },
      { name: 'text_search_index' }
    );

    // Index for filtering by tags
    await books.createIndex({ tags: 1 }, { name: 'tags_index' });

    // Index for filtering by categories
    await books.createIndex({ categories: 1 }, { name: 'categories_index' });

    // Index for filtering by reading status
    await books.createIndex({ 'progress.status': 1 }, { name: 'status_index' });

    // Index for sorting by creation date
    await books.createIndex({ createdAt: -1 }, { name: 'created_at_index' });

    console.log('✓ All indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}
