'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { updateBookAction } from '@/lib/actions/books';
import { useRouter } from 'next/navigation';

interface EditableStatusProps {
  bookId: string;
  currentStatus: 'to-read' | 'reading' | 'completed' | 'abandoned';
}

const statusOptions = [
  { value: 'to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
] as const;

export function EditableStatus({ bookId, currentStatus }: EditableStatusProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as typeof currentStatus);

    startTransition(async () => {
      const result = await updateBookAction(bookId, {
        progress: {
          status: newStatus as typeof currentStatus,
        },
      });

      if (result.success) {
        router.refresh();
      } else {
        // Revert on error
        setStatus(currentStatus);
        alert(result.error || 'Failed to update status');
      }
    });
  };

  const statusColors = {
    'to-read': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    'reading': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    'completed': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    'abandoned': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/20',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground/60">Status:</span>
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
          className={`appearance-none border rounded-lg px-4 py-2 pr-10 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50 ${statusColors[status]}`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin opacity-70" />
          ) : (
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
