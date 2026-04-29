import { config } from 'dotenv';
import { connectToDatabase } from '../lib/db/mongodb';

// Load environment variables from .env.local
config({ path: '.env.local' });

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    notes: "# Classic American Novel\n\nA story of decadence and excess in the Jazz Age.",
    progress: {
      status: 'completed' as const,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-15'),
      currentPage: 180,
      totalPages: 180,
    },
    tags: ['classic', 'fiction', 'american'],
    categories: ['2024-reads'],
    rating: 5,
    summary: "A masterpiece exploring themes of wealth, love, and the American Dream in the 1920s.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    notes: "# Dystopian Masterpiece\n\n## Key Themes\n- Surveillance\n- Totalitarianism\n- Freedom",
    progress: {
      status: 'reading' as const,
      startDate: new Date('2024-04-20'),
      currentPage: 150,
      totalPages: 328,
    },
    tags: ['dystopia', 'classic', 'political'],
    categories: ['2024-reads', 'sci-fi'],
    rating: 5,
    summary: "A chilling portrayal of a totalitarian future where Big Brother watches everything.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    notes: "# Important American Classic\n\nSet in the Deep South during the 1930s.",
    progress: {
      status: 'to-read' as const,
    },
    tags: ['classic', 'fiction', 'american'],
    categories: ['wishlist'],
    summary: "A gripping tale of racial injustice and childhood innocence in the American South.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    notes: "# Romance Classic\n\nExplores manners and marriage in Georgian England.",
    progress: {
      status: 'completed' as const,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
      currentPage: 279,
      totalPages: 279,
    },
    tags: ['classic', 'romance', 'british'],
    categories: ['2024-reads', 'favorites'],
    rating: 4,
    summary: "The timeless story of Elizabeth Bennet and Mr. Darcy.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    notes: "# Fantasy Adventure\n\n## Characters\n- Bilbo Baggins\n- Gandalf\n- Thorin",
    progress: {
      status: 'reading' as const,
      startDate: new Date('2024-04-15'),
      currentPage: 100,
      totalPages: 310,
    },
    tags: ['fantasy', 'adventure', 'classic'],
    categories: ['2024-reads'],
    rating: 5,
    summary: "Bilbo Baggins' unexpected journey to reclaim treasure guarded by a dragon.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  console.log('Seeding database with sample books...');

  try {
    const { db } = await connectToDatabase();
    const booksCollection = db.collection('books');

    // Clear existing books
    const deleteResult = await booksCollection.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing books`);

    // Insert sample books
    const result = await booksCollection.insertMany(sampleBooks);
    console.log(`Inserted ${result.insertedCount} sample books`);

    // List the books
    const books = await booksCollection.find({}).toArray();
    console.log('\nSeeded books:');
    books.forEach((book) => {
      console.log(`  - ${book.title} by ${book.author} (ISBN: ${book.isbn})`);
    });

    console.log('\nDatabase seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seed();
