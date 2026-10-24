import { z } from "zod";

// ── Common Building Blocks ──
export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const paginationQuerySchema = z.object({
  cursor: objectIdSchema.optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(Math.max(parseInt(val, 10) || 12, 1), 50) : 12)),
  category: z.string().trim().optional(),
});

// ── Channel Schemas ──
export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be at least 2 characters")
    .max(60, "Channel name cannot exceed 60 characters"),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional(),
  category: z.string().trim().min(1, "Category is required"),
});

export const updateChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be at least 2 characters")
    .max(60, "Channel name cannot exceed 60 characters")
    .optional(),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional(),
  category: z.string().trim().min(1, "Category cannot be empty").optional(),
});

// ── Video Schemas ──
export const createVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().max(5000, "Description cannot exceed 5000 characters").optional(),
  tags: z.string().optional(),
  channelId: objectIdSchema,
});

export const updateVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  description: z.string().trim().max(5000, "Description cannot exceed 5000 characters").optional(),
  tags: z.string().optional(),
});

// ── Short Schemas ──
export const createShortSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().max(2000, "Description cannot exceed 2000 characters").optional(),
  tags: z.string().optional(),
  channelId: objectIdSchema,
});

// ── Playlist Schemas ──
export const createPlaylistSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional(),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
  channelId: objectIdSchema,
});

export const addVideoToPlaylistSchema = z.object({
  videoId: objectIdSchema,
});

// ── Community Post Schemas ──
export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content cannot be empty")
    .max(5000, "Content cannot exceed 5000 characters"),
  channelId: objectIdSchema,
});

// ── Comment Schemas ──
export const createCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

export const createReplySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

// ── Search & Recommendations Query Schemas ──
export const searchQuerySchema = z.object({
  query: z.string().trim().min(1, "Search query is required").max(100),
});

export const recommendationQuerySchema = z.object({
  videoId: objectIdSchema.optional(),
});
