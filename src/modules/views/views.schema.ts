import { z } from 'zod';

const sourceSchema = z.object({
  type: z.enum(['LINK', 'YOUTUBE', 'DOCUMENT']),
  url: z.string().url(),
  label: z.string().min(1).optional(),
});

const sideSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  sources: z.array(sourceSchema).min(1, 'At least one source is required'),
});

export const createViewSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    side: sideSchema,
    counterpart: sideSchema,
    hashtags: z.array(z.string().min(1).max(50)).max(10).optional(),
  }),
});

export const updateViewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    categoryId: z.string().uuid(),
    side: sideSchema,
    counterpart: sideSchema,
    hashtags: z.array(z.string().min(1).max(50)).max(10).optional(),
  }),
});

export const listViewsSchema = z.object({
  query: z.object({
    category: z.string().uuid().optional(),
    hashtag: z.string().min(1).optional(),
    sort: z.enum(['likes', 'dislikes', 'recent']).optional().default('recent'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    autorId: z.string().uuid().optional(),
    autor: z.literal('me').optional(),
  }),
});

export const viewIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
