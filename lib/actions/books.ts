'use server';

import { revalidatePath } from 'next/cache';
import * as db from '@/lib/db/books';
import {
  createBookSchema,
  updateBookSchema,
  addReadingSessionSchema,
  quickProgressUpdateSchema
} from '@/lib/schemas/book';
import type { CreateBookInput, UpdateBookInput, ReadingSession } from '@/lib/types/book';

export async function getBooksAction(filters?: {
  status?: string;
  tags?: string[];
  categories?: string[];
  search?: string;
}) {
  try {
    const books = await db.getBooks(filters);
    return { success: true, data: books };
  } catch (error) {
    console.error('Error fetching books:', error);
    return { success: false, error: 'Failed to fetch books' };
  }
}

export async function getBookByIdAction(id: string) {
  try {
    const book = await db.getBookById(id);
    if (!book) {
      return { success: false, error: 'Book not found' };
    }
    return { success: true, data: book };
  } catch (error) {
    console.error('Error fetching book:', error);
    return { success: false, error: 'Failed to fetch book' };
  }
}

export async function createBookAction(input: CreateBookInput) {
  try {
    // Validate input
    const validated = createBookSchema.parse(input);

    // Create book
    const bookId = await db.createBook(validated);

    // Revalidate pages
    revalidatePath('/books');

    return { success: true, data: bookId };
  } catch (error) {
    console.error('Error creating book:', error);
    return { success: false, error: 'Failed to create book' };
  }
}

export async function updateBookAction(id: string, input: UpdateBookInput) {
  try {
    // Validate input
    const validated = updateBookSchema.parse(input);

    // Update book
    const success = await db.updateBook(id, validated);

    if (!success) {
      return { success: false, error: 'Book not found or not updated' };
    }

    // Revalidate pages
    revalidatePath('/books');
    revalidatePath(`/books/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating book:', error);
    return { success: false, error: 'Failed to update book' };
  }
}

export async function deleteBookAction(id: string) {
  try {
    const success = await db.deleteBook(id);

    if (!success) {
      return { success: false, error: 'Book not found' };
    }

    // Revalidate pages
    revalidatePath('/books');

    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    return { success: false, error: 'Failed to delete book' };
  }
}

export async function searchBooksAction(query: string) {
  try {
    const books = await db.searchBooks(query);
    return { success: true, data: books };
  } catch (error) {
    console.error('Error searching books:', error);
    return { success: false, error: 'Failed to search books' };
  }
}

export async function getAllTagsAction() {
  try {
    const tags = await db.getAllTags();
    return { success: true, data: tags };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

export async function getAllCategoriesAction() {
  try {
    const categories = await db.getAllCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

// Reading Session Actions

export async function addReadingSessionAction(input: {
  bookId: string;
  currentPage: number;
  note?: string;
  duration?: number;
}) {
  try {
    const validated = addReadingSessionSchema.parse(input);

    const session: ReadingSession = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      pageEnd: validated.currentPage,
      note: validated.note,
      duration: validated.duration,
    };

    // Get current page to set as pageStart
    const bookResult = await db.getBookById(validated.bookId);
    if (!bookResult) {
      return { success: false, error: 'Book not found' };
    }

    session.pageStart = bookResult.progress.currentPage || 0;

    // Determine status updates based on progress
    const progressUpdates: any = { currentPage: validated.currentPage };
    const currentStatus = bookResult.progress.status;
    const totalPages = bookResult.progress.totalPages || 0;

    // Auto-update status: to-read -> reading
    if (currentStatus === 'to-read' && validated.currentPage > 0) {
      progressUpdates.status = 'reading';
      progressUpdates.startDate = new Date();
    }

    // Auto-update status: reading -> completed (when reaching last page)
    if (totalPages > 0 && validated.currentPage >= totalPages) {
      progressUpdates.status = 'completed';
      progressUpdates.endDate = new Date();
      // Set startDate if not already set
      if (!bookResult.progress.startDate) {
        progressUpdates.startDate = new Date();
      }
    }

    // Add session and update current page atomically
    const success = await db.addReadingSession(
      validated.bookId,
      session,
      validated.currentPage
    );

    if (!success) {
      return { success: false, error: 'Failed to add reading session' };
    }

    // Update progress/status if needed
    if (Object.keys(progressUpdates).length > 1) { // More than just currentPage
      await db.updateBook(validated.bookId, {
        progress: progressUpdates,
      });
    }

    revalidatePath(`/books/${validated.bookId}`);
    revalidatePath('/books'); // Refresh library view
    return { success: true, data: session };
  } catch (error) {
    console.error('Error adding reading session:', error);
    return { success: false, error: 'Failed to add reading session' };
  }
}

export async function quickProgressUpdateAction(input: {
  bookId: string;
  currentPage: number;
  note?: string;
}) {
  try {
    const validated = quickProgressUpdateSchema.parse(input);

    // If note is provided, create a session (which handles status updates)
    if (validated.note && validated.note.trim()) {
      return addReadingSessionAction(validated);
    }

    // Get book to check current status
    const bookResult = await db.getBookById(validated.bookId);
    if (!bookResult) {
      return { success: false, error: 'Book not found' };
    }

    // Determine status updates
    const progressUpdates: any = { currentPage: validated.currentPage };
    const currentStatus = bookResult.progress.status;
    const totalPages = bookResult.progress.totalPages || 0;

    // Auto-update status: to-read -> reading
    if (currentStatus === 'to-read' && validated.currentPage > 0) {
      progressUpdates.status = 'reading';
      progressUpdates.startDate = new Date();
    }

    // Auto-update status: reading -> completed (when reaching last page)
    if (totalPages > 0 && validated.currentPage >= totalPages) {
      progressUpdates.status = 'completed';
      progressUpdates.endDate = new Date();
      // Set startDate if not already set
      if (!bookResult.progress.startDate) {
        progressUpdates.startDate = new Date();
      }
    }

    // Update the progress
    const success = await db.updateBook(validated.bookId, {
      progress: progressUpdates,
    });

    if (!success) {
      return { success: false, error: 'Failed to update progress' };
    }

    revalidatePath(`/books/${validated.bookId}`);
    revalidatePath('/books'); // Refresh library view to show status change
    return { success: true };
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

export async function getReadingSessionsAction(
  bookId: string,
  limit = 20,
  offset = 0
) {
  try {
    const sessions = await db.getReadingSessions(bookId, limit, offset);
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return { success: false, error: 'Failed to fetch sessions' };
  }
}

export async function deleteReadingSessionAction(bookId: string, sessionId: string) {
  try {
    const success = await db.deleteReadingSession(bookId, sessionId);

    if (!success) {
      return { success: false, error: 'Session not found' };
    }

    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}
