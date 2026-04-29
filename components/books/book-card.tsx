'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookmarkIcon, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { Book } from '@/lib/types/book';

// Serialized version of Book for client components
type SerializedBook = Omit<Book, '_id' | 'createdAt' | 'updatedAt' | 'progress'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  progress: Omit<Book['progress'], 'startDate' | 'endDate'> & {
    startDate?: string;
    endDate?: string;
  };
};

interface BookCardProps {
  book: SerializedBook;
}

const statusConfig = {
  'to-read': {
    label: 'Want to Read',
    icon: BookmarkIcon,
    color: 'bg-amber-500/90 text-white',
    accentColor: 'text-amber-600 dark:text-amber-400',
  },
  'reading': {
    label: 'Reading',
    icon: Clock,
    color: 'bg-blue-500/90 text-white',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  'completed': {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'bg-emerald-500/90 text-white',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
  },
  'abandoned': {
    label: 'Abandoned',
    icon: XCircle,
    color: 'bg-slate-500/90 text-white',
    accentColor: 'text-slate-600 dark:text-slate-400',
  },
};

export function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const status = statusConfig[book.progress.status];
  const StatusIcon = status.icon;

  return (
    <Link href={`/books/${book._id}`} className="group block">
      <article className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-foreground/5 to-foreground/10 border border-border transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2 hover:scale-[1.02]">
        {/* Cover Image */}
        {book.coverUrl && !imageError ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback when no cover or error
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground/10 to-foreground/20">
            <BookOpen className="w-16 h-16 text-foreground/30" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-lg ${status.color} backdrop-blur-sm`}>
            <StatusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="text-xs font-semibold">{status.label}</span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {/* Title */}
          <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-3">
            {book.title}
          </h3>

          {/* Author */}
          {book.author && (
            <p className="text-white/80 text-sm mb-3 line-clamp-1">
              {book.author}
            </p>
          )}

          {/* Categories */}
          {book.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-medium text-white border border-white/30"
                >
                  {category}
                </span>
              ))}
              {book.categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-medium text-white border border-white/30">
                  +{book.categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tags (if no categories) */}
          {book.categories.length === 0 && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-medium text-white border border-white/30"
                >
                  {tag}
                </span>
              ))}
              {book.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-medium text-white border border-white/30">
                  +{book.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Reading Progress Bar (only for 'reading' status) */}
          {book.progress.status === 'reading' && book.progress.totalPages && book.progress.currentPage && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between items-center text-xs text-white/90 mb-1.5">
                <span>Progress</span>
                <span className="font-semibold">
                  {Math.round((book.progress.currentPage / book.progress.totalPages) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((book.progress.currentPage / book.progress.totalPages) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
