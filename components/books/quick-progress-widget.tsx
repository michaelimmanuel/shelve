'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { quickProgressUpdateAction } from '@/lib/actions/books';
import { WysiwygNoteEditor } from './wysiwyg-note-editor';

interface QuickProgressWidgetProps {
  bookId: string;
  currentPage: number;
  totalPages: number;
  initialProgress: number;
  latestSessionPage?: number; // Latest page from reading sessions
  currentStatus: 'to-read' | 'reading' | 'completed' | 'abandoned';
}

export function QuickProgressWidget({
  bookId,
  currentPage,
  totalPages,
  initialProgress,
  latestSessionPage,
  currentStatus,
}: QuickProgressWidgetProps) {
  // Use the latest session page if available, otherwise use currentPage
  const startingPage = latestSessionPage && latestSessionPage > currentPage
    ? latestSessionPage
    : currentPage;

  const [page, setPage] = useState(startingPage.toString());
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate progress relative to the session (from startingPage to current input)
  const sessionProgress = totalPages
    ? Math.round(((parseInt(page) - startingPage) / (totalPages - startingPage)) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pageNum = parseInt(page);

    // Validation
    if (isNaN(pageNum) || pageNum < 0) {
      setError('Please enter a valid page number');
      return;
    }

    if (totalPages && pageNum > totalPages) {
      setError(`Page number cannot exceed ${totalPages}`);
      return;
    }

    if (pageNum === currentPage && !note.trim()) {
      setError('No changes to save');
      return;
    }

    setLoading(true);

    try {
      const result = await quickProgressUpdateAction({
        bookId,
        currentPage: pageNum,
        note: note.trim() || undefined,
      });

      if (result.success) {
        // Success - page will revalidate
        setNote('');
        setShowNoteInput(false);
        setError('');
        window.location.reload(); // Simple reload to show updated data
      } else {
        setError(result.error || 'Failed to update progress');
      }
    } catch (err) {
      setError('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const progress = totalPages
    ? Math.round((parseInt(page) / totalPages) * 100)
    : 0;

  // Detect status changes
  const pageNum = parseInt(page);
  const willStartReading = currentStatus === 'to-read' && pageNum > 0;
  const willComplete = totalPages > 0 && pageNum >= totalPages && currentStatus !== 'completed';

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Status Change Alerts */}
      {willStartReading && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-blue-600 dark:text-blue-400">Starting your reading journey!</span>
            <p className="text-foreground/70 text-xs mt-0.5">Status will change to "Currently Reading"</p>
          </div>
        </div>
      )}

      {willComplete && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Finishing the book!</span>
            <p className="text-foreground/70 text-xs mt-0.5">Status will change to "Completed" 🎉</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Page Input with Slider */}
        <div>
          <Label htmlFor="currentPage" className="text-sm font-medium mb-3 block">
            Currently on page
          </Label>

          {/* Page Input */}
          <div className="flex items-center gap-3 mb-4">
            <Input
              id="currentPage"
              type="number"
              min="0"
              max={totalPages || undefined}
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-28 text-lg font-semibold"
              disabled={loading}
            />
            <span className="text-lg text-foreground/60 font-medium">
              / {totalPages || '—'}
            </span>
            <div className="flex-1" />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>

          {/* Slider */}
          {totalPages > 0 && (
            <div className="mb-2">
              <input
                type="range"
                min={startingPage}
                max={totalPages}
                value={page}
                onChange={(e) => setPage(e.target.value)}
                disabled={loading}
                className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right,
                    var(--accent) 0%,
                    var(--accent) ${sessionProgress}%,
                    rgba(0,0,0,0.1) ${sessionProgress}%,
                    rgba(0,0,0,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-foreground/50 mt-1">
                <span>Page {startingPage}</span>
                <span>Page {totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Display */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center text-sm text-foreground/60">
            <span>
              {parseInt(page) > startingPage
                ? `+${parseInt(page) - startingPage} pages this session`
                : 'Session progress'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-accent">{progress}%</span>
              <span className="text-xs">of book</span>
            </div>
          </div>
        )}

        {/* Note Input (Collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            {showNoteInput ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Add a note (optional)</span>
          </button>

          {showNoteInput && (
            <div className="mt-3">
              <WysiwygNoteEditor
                value={note}
                onChange={setNote}
                placeholder="What are your thoughts on this section?"
                minHeight="100px"
                disabled={loading}
              />
              <p className="text-xs text-foreground/50 mt-1.5">
                Use the formatting toolbar to add bold, italic, links, and lists. Adding a note will create a reading session entry.
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
