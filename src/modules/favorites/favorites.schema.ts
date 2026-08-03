import { z } from 'zod';

export const favoriteViewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
