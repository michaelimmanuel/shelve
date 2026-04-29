import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';
import type { Book, CreateBookInput, UpdateBookInput, ReadingSession } from '@/lib/types/book';

const COLLECTION_NAME = 'books';

export async function getBooks(filters?: {
  status?: string;
  tags?: string[];
  categories?: string[];
  search?: string;
}) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const query: any = {};

  if (filters?.status) {
    query['progress.status'] = filters.status;
  }

  if (filters?.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  if (filters?.categories && filters.categories.length > 0) {
    query.categories = { $in: filters.categories };
  }

  if (filters?.search) {
    query.$text = { $search: filters.search };
  }

  const books = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return books;
}

export async function getBookById(id: string) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const book = await collection.findOne({ _id: new ObjectId(id) });
  return book;
}

export async function createBook(input: CreateBookInput) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const now = new Date();
  const book = {
    ...input,
    tags: input.tags || [],
    categories: input.categories || [],
    notes: input.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(book as any);
  return result.insertedId.toString();
}

export async function updateBook(id: string, input: UpdateBookInput) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  // Handle partial progress updates
  if (input.progress) {
    const currentBook = await getBookById(id);
    if (currentBook) {
      updateData.progress = {
        ...currentBook.progress,
        ...input.progress,
      };
    }
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  return result.modifiedCount > 0;
}

export async function deleteBook(id: string) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function searchBooks(query: string) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const books = await collection
    .find({ $text: { $search: query } })
    .sort({ createdAt: -1 })
    .toArray();

  return books;
}

export async function getAllTags() {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const tags = await collection.distinct('tags');
  return tags.filter(Boolean).sort();
}

export async function getAllCategories() {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const categories = await collection.distinct('categories');
  return categories.filter(Boolean).sort();
}

// Reading Session Methods

export async function addReadingSession(
  bookId: string,
  session: ReadingSession,
  newCurrentPage: number
) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(bookId) },
    {
      $push: { readingSessions: session as any },
      $set: {
        'progress.currentPage': newCurrentPage,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

export async function getReadingSessions(
  bookId: string,
  limit = 20,
  offset = 0
) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const book = await collection.findOne(
    { _id: new ObjectId(bookId) },
    {
      projection: {
        readingSessions: { $slice: [offset * -1 - limit, limit] },
      },
    }
  );

  // Return sessions in reverse chronological order (newest first)
  return book?.readingSessions?.reverse() || [];
}

export async function deleteReadingSession(bookId: string, sessionId: string) {
  const db = await getDatabase();
  const collection = db.collection<Book>(COLLECTION_NAME);

  const result = await collection.updateOne(
    { _id: new ObjectId(bookId) },
    {
      $pull: { readingSessions: { id: sessionId } as any },
      $set: { updatedAt: new Date() },
    }
  );

  return result.modifiedCount > 0;
}
