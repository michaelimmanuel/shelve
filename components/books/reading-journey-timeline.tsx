'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { SessionEntry } from './session-entry';
import { Button } from '@/components/ui/button';
import { getReadingSessionsAction } from '@/lib/actions/books';
import type { ReadingSession } from '@/lib/types/book';

interface ReadingJourneyTimelineProps {
  bookId: string;
  initialSessions: ReadingSession[];
  totalPages: number;
}

export function ReadingJourneyTimeline({
  bookId,
  initialSessions,
  totalPages,
}: ReadingJourneyTimelineProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialSessions.length >= 20);
  const [offset, setOffset] = useState(1);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const result = await getReadingSessionsAction(bookId, 20, offset);
      if (result.success && result.data) {
        setSessions((prev) => [...prev, ...result.data]);
        setHasMore(result.data.length >= 20);
        setOffset((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load more sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionDeleted = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
          <BookOpen className="w-8 h-8 text-accent/60" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No reading sessions yet</h3>
        <p className="text-sm text-foreground/60 max-w-md mx-auto">
          Start tracking your reading journey by updating your progress above. Add notes to create session entries!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Timeline */}
      <div className="space-y-0">
        {sessions.map((session) => (
          <SessionEntry
            key={session.id}
            session={session}
            bookId={bookId}
            totalPages={totalPages}
            onDelete={() => handleSessionDeleted(session.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load older sessions'}
          </Button>
        </div>
      )}
    </div>
  );
}
