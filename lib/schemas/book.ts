import { z } from 'zod';

export const readingStatusSchema = z.enum(['to-read', 'reading', 'completed', 'abandoned']);

export const readingProgressSchema = z.object({
  status: readingStatusSchema,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  currentPage: z.number().int().min(0).optional(),
  totalPages: z.number().int().min(0).optional(),
});

export const readingSessionSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  pageStart: z.number().int().min(0).optional(),
  pageEnd: z.number().int().min(0).optional(),
  note: z.string().optional(),
  duration: z.number().int().min(0).optional(), // in minutes
});

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  author: z.string().max(200).optional().or(z.literal('')),
  isbn: z.string().max(20).optional(),
  notes: z.string().default(''),
  progress: readingProgressSchema,
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  coverUrl: z.string().url().optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).optional(),
  summary: z.string().max(1000).optional(),
  readingSessions: z.array(readingSessionSchema).default([]),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  author: z.string().max(200).optional().or(z.literal('')),
  isbn: z.string().max(20).optional(),
  notes: z.string().optional(),
  progress: readingProgressSchema.partial().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).optional(),
  summary: z.string().max(1000).optional(),
});

// For form data (handles string dates that need conversion)
export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  author: z.string().max(200).optional().or(z.literal('')),
  isbn: z.string().max(20).optional(),
  notes: z.string().default(''),
  status: readingStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currentPage: z.coerce.number().int().min(0).optional(),
  totalPages: z.coerce.number().int().min(0).optional(),
  tags: z.string().optional(), // Comma-separated string
  categories: z.string().optional(), // Comma-separated string
  coverUrl: z.string().url().optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  summary: z.string().max(1000).optional(),
});

// Schema for adding a reading session
export const addReadingSessionSchema = z.object({
  bookId: z.string(),
  currentPage: z.number().int().min(0),
  note: z.string().optional(),
  duration: z.number().int().min(0).optional(),
});

// Schema for quick progress update
export const quickProgressUpdateSchema = z.object({
  bookId: z.string(),
  currentPage: z.number().int().min(0),
  note: z.string().optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookFormInput = z.infer<typeof bookFormSchema>;
export type ReadingSessionInput = z.infer<typeof readingSessionSchema>;
export type AddReadingSessionInput = z.infer<typeof addReadingSessionSchema>;
export type QuickProgressUpdateInput = z.infer<typeof quickProgressUpdateSchema>;
