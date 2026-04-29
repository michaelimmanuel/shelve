import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBookByIdAction } from '@/lib/actions/books';
import { DeleteBookButton } from '@/components/books/delete-book-button';
import { CoverImagePreview } from '@/components/books/cover-image-preview';
import { QuickProgressWidget } from '@/components/books/quick-progress-widget';
import { ReadingJourneyTimeline } from '@/components/books/reading-journey-timeline';
import { EditableStatus } from '@/components/books/editable-status';

const statusLabels = {
  'to-read': 'Want to Read',
  'reading': 'Currently Reading',
  'completed': 'Completed',
  'abandoned': 'Abandoned',
};

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getBookByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const book = result.data;
  const progress = book.progress.totalPages && book.progress.currentPage
    ? Math.round((book.progress.currentPage / book.progress.totalPages) * 100)
    : null;

  // Get initial reading sessions
  const initialSessions = book.readingSessions?.slice(0, 20).reverse() || [];

  // Get the latest session page for pre-filling the input
  const latestSessionPage = initialSessions.length > 0
    ? initialSessions[0].pageEnd
    : undefined;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Sticky Back Button */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/books">
          <Button variant="outline" className="shadow-lg backdrop-blur-sm bg-background/95">
            ← Back to Library
          </Button>
        </Link>
      </div>

      {/* Sticky Anchor Navigation */}
      <nav className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border mb-8 -mx-4 px-4 py-3">
        <div className="flex gap-6 text-sm">
          <a href="#overview" className="text-foreground/70 hover:text-foreground transition-colors">
            Overview
          </a>
          <a href="#details" className="text-foreground/70 hover:text-foreground transition-colors">
            Details
          </a>
          <a href="#progress" className="text-foreground/70 hover:text-foreground transition-colors">
            Progress
          </a>
          <a href="#journey" className="text-foreground/70 hover:text-foreground transition-colors">
            Journey
          </a>
        </div>
      </nav>
      {/* Header - id="overview" */}
      <section id="overview" className="scroll-mt-20 mb-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            {book.author && (
              <p className="text-xl text-foreground/70">{book.author}</p>
            )}
          </div>
          <div className="flex gap-2">
            <DeleteBookButton bookId={book._id.toString()} />
          </div>
        </div>

        {/* Cover Image */}
        {book.coverUrl && (
          <div className="mb-8 flex justify-center">
            <CoverImagePreview
              coverUrl={book.coverUrl}
              title={book.title}
              className="max-w-sm w-full"
            />
          </div>
        )}
      </section>

      {/* Details Section - id="details" */}
      <section id="details" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Book Details</h2>

        <div className="space-y-4">
          <EditableStatus bookId={id} currentStatus={book.progress.status} />

          {book.progress.startDate && (
            <div>
              <span className="text-sm text-foreground/60">Started: </span>
              <span className="text-sm">{new Date(book.progress.startDate).toLocaleDateString()}</span>
            </div>
          )}

          {book.progress.endDate && (
            <div>
              <span className="text-sm text-foreground/60">Finished: </span>
              <span className="text-sm">{new Date(book.progress.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

      {/* Tags & Categories */}
      {(book.tags.length > 0 || book.categories.length > 0) && (
        <div className="mb-8 space-y-2">
          {book.tags.length > 0 && (
            <div>
              <span className="text-sm text-foreground/60 mr-2">Tags:</span>
              <div className="inline-flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {book.categories.length > 0 && (
            <div>
              <span className="text-sm text-foreground/60 mr-2">Categories:</span>
              <div className="inline-flex flex-wrap gap-2">
                {book.categories.map((category) => (
                  <Badge key={category} variant="outline">{category}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Details */}
      {(book.isbn || book.rating) && (
        <div className="mb-8 space-y-2">
          {book.isbn && (
            <div>
              <span className="text-sm text-foreground/60">ISBN: </span>
              <span className="text-sm">{book.isbn}</span>
            </div>
          )}
          {book.rating && (
            <div>
              <span className="text-sm text-foreground/60">Rating: </span>
              <span className="text-sm">{'⭐'.repeat(book.rating)}</span>
            </div>
          )}
        </div>
      )}

        {/* Summary */}
        {book.summary && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p className="text-foreground/80">{book.summary}</p>
          </div>
        )}
      </section>

      {/* Progress Widget Section - id="progress" */}
      <section id="progress" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Reading Progress</h2>
        <QuickProgressWidget
          bookId={id}
          currentPage={book.progress.currentPage || 0}
          totalPages={book.progress.totalPages || 0}
          initialProgress={progress || 0}
          latestSessionPage={latestSessionPage}
          currentStatus={book.progress.status}
        />
      </section>

      {/* Journey Timeline Section - id="journey" */}
      <section id="journey" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Reading Journey</h2>
        <ReadingJourneyTimeline
          bookId={id}
          initialSessions={initialSessions}
          totalPages={book.progress.totalPages || 0}
        />
      </section>

    </div>
  );
}
