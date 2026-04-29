import { BookForm } from '@/components/books/book-form';

export default function NewBookPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Add New Book</h1>
      <BookForm mode="create" />
    </div>
  );
}
