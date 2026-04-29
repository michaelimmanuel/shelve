import { ObjectId } from 'mongodb';

export type ReadingStatus = 'to-read' | 'reading' | 'completed' | 'abandoned';

export interface ReadingSession {
  id: string;              // UUID for reference
  timestamp: Date;         // When session was logged
  pageStart?: number;      // Starting page (from previous currentPage)
  pageEnd?: number;        // Ending page (becomes new currentPage)
  note?: string;          // Optional markdown note
  duration?: number;       // Optional reading time in minutes
}

export interface ReadingProgress {
  status: ReadingStatus;
  startDate?: Date;
  endDate?: Date;
  currentPage?: number;
  totalPages?: number;
}

export interface Book {
  _id: ObjectId;
  title: string;
  author?: string; // Optional since API may not provide it
  isbn?: string;
  notes: string; // Markdown content
  progress: ReadingProgress;
  tags: string[];
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
  coverUrl?: string;
  rating?: number;
  summary?: string;
  readingSessions?: ReadingSession[]; // Timeline of reading sessions
}

// For creating new books (without _id, createdAt, updatedAt)
export interface CreateBookInput {
  title: string;
  author?: string;
  isbn?: string;
  notes?: string;
  progress: ReadingProgress;
  tags?: string[];
  categories?: string[];
  coverUrl?: string;
  rating?: number;
  summary?: string;
}

// For updating books (all fields optional except id)
export interface UpdateBookInput {
  title?: string;
  author?: string;
  isbn?: string;
  notes?: string;
  progress?: Partial<ReadingProgress>;
  tags?: string[];
  categories?: string[];
  coverUrl?: string;
  rating?: number;
  summary?: string;
}
