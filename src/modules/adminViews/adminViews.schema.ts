import { z } from 'zod';

export const listAdminViewsSchema = z.object({
  query: z.object({
    status: z.enum(['PUBLISHED', 'UNPUBLISHED']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
});
