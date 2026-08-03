import { z } from 'zod';

export const listHashtagsSchema = z.object({
  query: z.object({
    q: z.string().min(1).optional(),
  }),
});
