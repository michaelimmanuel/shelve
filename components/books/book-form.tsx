'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from './markdown-editor';
import { CoverImagePreview } from './cover-image-preview';
import { createBookAction, updateBookAction } from '@/lib/actions/books';
import { isValidISBN, cleanISBN, getOpenLibraryCoverUrl, fetchBookMetadata } from '@/lib/utils/covers';
import type { Book } from '@/lib/types/book';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface BookFormProps {
  book?: Book;
  mode: 'create' | 'edit';
}

export function BookForm({ book, mode }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataFetched, setMetadataFetched] = useState(false);

  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    notes: book?.notes || '',
    status: book?.progress.status || 'to-read',
    startDate: book?.progress.startDate ? new Date(book.progress.startDate).toISOString().split('T')[0] : '',
    endDate: book?.progress.endDate ? new Date(book.progress.endDate).toISOString().split('T')[0] : '',
    currentPage: book?.progress.currentPage?.toString() || '',
    totalPages: book?.progress.totalPages?.toString() || '',
    tags: book?.tags.join(', ') || '',
    categories: book?.categories.join(', ') || '',
    coverUrl: book?.coverUrl || '',
    rating: book?.rating?.toString() || '',
    summary: book?.summary || '',
  });

  // Auto-fetch cover and metadata when ISBN changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanedISBN = cleanISBN(formData.isbn);
      if (cleanedISBN && isValidISBN(cleanedISBN)) {
        setFetchingMetadata(true);
        setMetadataFetched(false);

        // Fetch cover URL
        const coverUrl = getOpenLibraryCoverUrl(cleanedISBN);

        // Fetch book metadata
        const metadata = await fetchBookMetadata(cleanedISBN);

        if (metadata) {
          setFormData(prev => ({
            ...prev,
            coverUrl,
            // Only auto-fill if fields are empty (don't override user input)
            title: prev.title || metadata.title || prev.title,
            author: prev.author || (metadata.authors?.[0] || prev.author),
            totalPages: prev.totalPages || (metadata.numberOfPages?.toString() || prev.totalPages),
          }));
          setMetadataFetched(true);
        } else {
          // Still update cover URL even if metadata fetch fails
          setFormData(prev => ({ ...prev, coverUrl }));
        }

        setFetchingMetadata(false);
      } else {
        setMetadataFetched(false);
      }
    }, 800); // 800ms debounce (slightly longer for API call)

    return () => clearTimeout(timer);
  }, [formData.isbn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || undefined,
        notes: formData.notes,
        progress: {
          status: formData.status as any,
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          currentPage: formData.currentPage ? parseInt(formData.currentPage) : undefined,
          totalPages: formData.totalPages ? parseInt(formData.totalPages) : undefined,
        },
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        categories: formData.categories ? formData.categories.split(',').map(c => c.trim()).filter(Boolean) : [],
        coverUrl: formData.coverUrl || undefined,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        summary: formData.summary || undefined,
      };

      const result = mode === 'create'
        ? await createBookAction(bookData)
        : await updateBookAction(book!._id.toString(), bookData);

      if (result.success) {
        router.push('/books');
        router.refresh();
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ISBN Lookup */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">ISBN Lookup</h2>
        <p className="text-sm text-foreground/60">
          Enter an ISBN to automatically fetch book details and cover image
        </p>

        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <div className="relative">
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="9780743273565"
              className="pr-10"
            />
            {fetchingMetadata && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-foreground/60" />
              </div>
            )}
            {metadataFetched && !fetchingMetadata && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>
          {metadataFetched && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Book details fetched successfully
            </p>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="Unknown author"
          />
        </div>
      </div>

      {/* Notes - Only in edit mode */}
      {mode === 'edit' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <MarkdownEditor
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
          />
        </div>
      )}

      {/* Reading Progress - Only in edit mode */}
      {mode === 'edit' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reading Progress</h2>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="flex h-10 w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              required
            >
              <option value="to-read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentPage">Current Page</Label>
              <Input
                id="currentPage"
                type="number"
                min="0"
                value={formData.currentPage}
                onChange={(e) => setFormData({ ...formData, currentPage: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="totalPages">Total Pages</Label>
              <Input
                id="totalPages"
                type="number"
                min="0"
                value={formData.totalPages}
                onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Organization */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Organization</h2>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="fiction, sci-fi, favorite"
          />
        </div>

        <div>
          <Label htmlFor="categories">Categories (comma-separated)</Label>
          <Input
            id="categories"
            value={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
            placeholder="2024-reads, book-club"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cover Image</h2>

        {/* Auto-fetch indicator */}
        {formData.isbn && isValidISBN(cleanISBN(formData.isbn)) && (
          <p className="text-sm text-foreground/60 mb-2">
            Auto-fetching from Open Library...
          </p>
        )}

        {/* Cover preview */}
        {formData.coverUrl && (
          <CoverImagePreview
            coverUrl={formData.coverUrl}
            title={formData.title || 'Book cover'}
            onClear={() => setFormData({ ...formData, coverUrl: '' })}
            className="mb-3"
          />
        )}

        {/* Manual input fallback */}
        <div>
          <Label htmlFor="coverUrl" className="text-sm text-foreground/60">
            Or enter custom cover URL
          </Label>
          <Input
            id="coverUrl"
            type="url"
            placeholder="https://example.com/cover.jpg"
            value={formData.coverUrl}
            onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
          />
        </div>
      </div>

      {/* Additional Fields - Only in edit mode */}
      {mode === 'edit' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Additional Details</h2>

          <div>
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Book' : 'Update Book'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
