import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/books"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-md shadow-accent/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/30 group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-2xl font-serif font-bold text-foreground tracking-tight transition-colors group-hover:text-accent">
              Shelve
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/books"
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/5 rounded-lg transition-all duration-200"
            >
              Library
            </Link>
            <Link
              href="/books/new"
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/5 rounded-lg transition-all duration-200"
            >
              Add Book
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
