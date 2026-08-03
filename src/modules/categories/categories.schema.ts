import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
