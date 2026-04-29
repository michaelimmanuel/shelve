import { notFound } from 'next/navigation';
import { BookForm } from '@/components/books/book-form';
import { getBookByIdAction } from '@/lib/actions/books';

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getBookByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Book</h1>
      <BookForm mode="edit" book={result.data} />
    </div>
  );
}
