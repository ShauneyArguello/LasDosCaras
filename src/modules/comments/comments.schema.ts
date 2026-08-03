import { z } from 'zod';

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1),
    parentId: z.string().uuid().optional(),
  }),
});

export const listCommentsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
});
