'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Trash2, Clock } from 'lucide-react';
import { formatRelativeTime, formatDuration } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { deleteReadingSessionAction } from '@/lib/actions/books';
import type { ReadingSession } from '@/lib/types/book';

interface SessionEntryProps {
  session: ReadingSession;
  bookId: string;
  totalPages: number;
  onDelete?: () => void;
}

export function SessionEntry({ session, bookId, totalPages, onDelete }: SessionEntryProps) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteReadingSessionAction(bookId, session.id);
      if (result.success) {
        onDelete?.();
      } else {
        alert(result.error || 'Failed to delete session');
      }
    } catch (error) {
      alert('Failed to delete session');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const pagesDelta = session.pageEnd && session.pageStart
    ? session.pageEnd - session.pageStart
    : session.pageEnd
    ? session.pageEnd
    : 0;

  const progressPercent = session.pageEnd && totalPages
    ? Math.round((session.pageEnd / totalPages) * 100)
    : 0;

  const sessionDate = new Date(session.timestamp);
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="relative pl-8 pb-8 group">
      {/* Date label (left of dot) */}
      <span className="absolute right-full top-0.5 mr-3 text-sm font-semibold text-foreground/70 whitespace-nowrap">
        {formattedDate}
      </span>

      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background shadow-sm" />

      {/* Timeline line */}
      <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-border group-last:hidden" />

      {/* Content card */}
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <time className="text-sm font-medium text-foreground">
                {formatRelativeTime(session.timestamp)}
              </time>
              {session.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-foreground/60 bg-foreground/5 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3" />
                  {formatDuration(session.duration)}
                </span>
              )}
            </div>

            {/* Page range */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {session.pageStart !== undefined && session.pageEnd !== undefined ? (
                <span className="text-sm text-foreground/70">
                  pp. {session.pageStart}–{session.pageEnd}
                </span>
              ) : session.pageEnd !== undefined ? (
                <span className="text-sm text-foreground/70">
                  Read to page {session.pageEnd}
                </span>
              ) : null}

              {pagesDelta > 0 && (
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +{pagesDelta} pages
                </span>
              )}

              {progressPercent > 0 && (
                <span className="text-xs text-foreground/50">
                  {progressPercent}% complete
                </span>
              )}
            </div>
          </div>

          {/* Delete button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {!showConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="h-8 w-8 p-0 text-foreground/50 hover:text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-7 px-2 text-xs"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        {session.note && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {session.note}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
