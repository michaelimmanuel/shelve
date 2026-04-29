import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BooksFilter } from '@/components/books/books-filter';
import { getBooksAction } from '@/lib/actions/books';
import { BookOpen, Plus } from 'lucide-react';

export default async function BooksPage() {
  const result = await getBooksAction();
  const books = result.success ? result.data : [];

  // Serialize books for client component (convert ObjectId to string)
  const serializedBooks = books.map(book => ({
    ...book,
    _id: book._id.toString(),
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    progress: {
      ...book.progress,
      startDate: book.progress.startDate?.toISOString(),
      endDate: book.progress.endDate?.toISOString(),
    },
  }));

  return (
    <div className="min-h-screen relative">
      {/* Decorative background gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-accent/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-accent-light/15 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="mb-16 animate-fade-in-up">
          <div className="flex items-start justify-between gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-8 h-8 text-accent" strokeWidth={1.5} />
                <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
                  My Library
                </h1>
              </div>
              <p className="text-lg text-foreground/60 max-w-2xl">
                A curated collection of literary journeys, insights, and discoveries
              </p>
            </div>

            <Link href="/books/new">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Book
              </Button>
            </Link>
          </div>
        </div>

        {/* Books Grid or Empty State */}
        {books.length === 0 ? (
          <div className="text-center py-24 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 mb-6">
              <BookOpen className="w-10 h-10 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Your Library Awaits</h2>
            <p className="text-lg text-foreground/60 mb-8 max-w-md mx-auto">
              Begin your literary journey by adding your first book. Track progress, capture insights, and build your personal collection.
            </p>
            <Link href="/books/new">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Book
              </Button>
            </Link>
          </div>
        ) : (
          <BooksFilter books={serializedBooks} />
        )}
      </div>
    </div>
  );
}
