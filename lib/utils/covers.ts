/**
 * Utility functions for handling book cover images and ISBN validation
 */

/**
 * Remove hyphens and spaces from ISBN string
 */
export function cleanISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}

/**
 * Validate ISBN-10 or ISBN-13 format
 * ISBN-10: 10 characters, last can be 'X'
 * ISBN-13: 13 digits starting with 978 or 979
 */
export function isValidISBN(isbn: string): boolean {
  const cleaned = cleanISBN(isbn);

  // ISBN-10: 10 characters, last can be X
  if (cleaned.length === 10) {
    return /^\d{9}[\dX]$/i.test(cleaned);
  }

  // ISBN-13: 13 digits starting with 978 or 979
  if (cleaned.length === 13) {
    return /^(978|979)\d{10}$/.test(cleaned);
  }

  return false;
}

/**
 * Construct Open Library cover URL from ISBN
 * @param isbn - The ISBN (will be cleaned automatically)
 * @param size - Image size: 'S' (small), 'M' (medium), 'L' (large). Default: 'L'
 * @returns URL to the cover image
 */
export function getOpenLibraryCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  const cleaned = cleanISBN(isbn);
  return `https://covers.openlibrary.org/b/isbn/${cleaned}-${size}.jpg`;
}

/**
 * Book metadata returned from Open Library API
 */
export interface BookMetadata {
  title?: string;
  authors?: string[];
  numberOfPages?: number;
  publishDate?: string;
  publishers?: string[];
}

/**
 * Fetch book metadata from Open Library API by ISBN
 * @param isbn - The ISBN to look up
 * @returns Book metadata or null if not found
 */
export async function fetchBookMetadata(isbn: string): Promise<BookMetadata | null> {
  const cleaned = cleanISBN(isbn);

  if (!isValidISBN(cleaned)) {
    return null;
  }

  try {
    const response = await fetch(`https://openlibrary.org/isbn/${cleaned}.json`, {
      headers: {
        'User-Agent': 'Shelve Book Tracker (contact: shelve@example.com)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Extract authors - Open Library has multiple formats
    let authors: string[] = [];

    // Format 1: Simple "author" array of strings (e.g., ["Coelho, Paulo."])
    if (data.author && Array.isArray(data.author)) {
      authors = data.author
        .map((a: any) => (typeof a === 'string' ? a.replace(/\.$/, '').trim() : ''))
        .filter(Boolean);
    }

    // Format 2: "authors" array with references or objects
    if (authors.length === 0 && data.authors && Array.isArray(data.authors)) {
      const authorPromises = data.authors.slice(0, 3).map(async (author: any) => {
        // Check if author has a direct name property
        if (author.name) {
          return author.name;
        }
        // Otherwise try to fetch from the key reference
        if (author.key) {
          try {
            const authorResponse = await fetch(`https://openlibrary.org${author.key}.json`, {
              headers: {
                'User-Agent': 'Shelve Book Tracker (contact: shelve@example.com)',
              },
            });
            if (authorResponse.ok) {
              const authorData = await authorResponse.json();
              return authorData.name || authorData.personal_name || '';
            }
          } catch {
            return '';
          }
        }
        return '';
      });

      const resolvedAuthors = await Promise.all(authorPromises);
      authors = resolvedAuthors.filter(Boolean);
    }

    // Format 3: Fallback to "by_statement" if authors array is still empty
    if (authors.length === 0 && data.by_statement) {
      authors = [data.by_statement];
    }

    return {
      title: data.title || undefined,
      authors: authors.length > 0 ? authors : undefined,
      numberOfPages: data.number_of_pages || undefined,
      publishDate: data.publish_date || undefined,
      publishers: data.publishers || undefined,
    };
  } catch (error) {
    console.error('Failed to fetch book metadata:', error);
    return null;
  }
}
