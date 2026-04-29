import { fetchBookMetadata } from '../lib/utils/covers';

async function test() {
  console.log('Testing Open Library metadata fetch...\n');

  const testISBNs = [
    { isbn: '9780743273565', title: 'The Great Gatsby' },
    { isbn: '9780062315007', title: 'The Alchemist' },
    { isbn: '9780547928227', title: 'The Hobbit' },
  ];

  for (const { isbn, title } of testISBNs) {
    console.log(`Fetching metadata for ${title} (${isbn})...`);
    const metadata = await fetchBookMetadata(isbn);

    if (metadata) {
      console.log('✓ Success:');
      console.log(`  Title: ${metadata.title}`);
      console.log(`  Authors: ${metadata.authors?.join(', ') || 'N/A'}`);
      console.log(`  Pages: ${metadata.numberOfPages || 'N/A'}`);
      console.log(`  Published: ${metadata.publishDate || 'N/A'}`);
    } else {
      console.log('✗ Failed to fetch metadata');
    }
    console.log('');

    // Wait 1 second between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

test();
