import { z } from "zod";

/**
 * Common validation schemas used across the application
 */

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ID validation
export const idSchema = z.object({
  id: z.string().cuid(),
});

export type IdInput = z.infer<typeof idSchema>;

// Search/Filter
export const searchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type SearchInput = z.infer<typeof searchSchema>;

// Date range
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
