import { z } from 'zod';

export const sideReactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    side: z.enum(['a', 'b']),
  }),
});
