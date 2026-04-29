'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteBookAction } from '@/lib/actions/books';

interface DeleteBookButtonProps {
  bookId: string;
}

export function DeleteBookButton({ bookId }: DeleteBookButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteBookAction(bookId);
      if (result.success) {
        router.push('/books');
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete book');
      }
    } catch (error) {
      alert('Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
