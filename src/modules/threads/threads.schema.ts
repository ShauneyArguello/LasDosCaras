import { z } from 'zod';

export const createThreadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1, 'The opening comment is required'),
  }),
});

export const listThreadsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
