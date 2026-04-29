'use client';

import { useState } from 'react';
import { BookCard } from './book-card';
import type { Book } from '@/lib/types/book';

type SerializedBook = Omit<Book, '_id' | 'createdAt' | 'updatedAt' | 'progress'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  progress: Omit<Book['progress'], 'startDate' | 'endDate'> & {
    startDate?: string;
    endDate?: string;
  };
};

interface BooksFilterProps {
  books: SerializedBook[];
}

type FilterStatus = 'all' | 'to-read' | 'reading' | 'completed' | 'abandoned';

const filters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All Books' },
  { value: 'to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
];

export function BooksFilter({ books }: BooksFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  const filteredBooks = activeFilter === 'all'
    ? books
    : books.filter(book => book.progress.status === activeFilter);

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => {
          const count = filter.value === 'all'
            ? books.length
            : books.filter(b => b.progress.status === filter.value).length;

          return (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.value
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'bg-card/60 text-foreground/70 hover:bg-card hover:text-foreground border border-border'
              }`}
            >
              {filter.label}
              <span className="ml-2 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-foreground/60">No books found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 stagger-children">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
