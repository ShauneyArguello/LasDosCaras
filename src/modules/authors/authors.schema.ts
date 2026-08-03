import { z } from 'zod';

export const authorIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
