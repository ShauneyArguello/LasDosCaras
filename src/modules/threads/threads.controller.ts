import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { createThread, listThreads } from './threads.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const thread = await createThread(req.params.id, req.user.id, req.body);
  res.status(201).json({ thread });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const threads = await listThreads(req.params.id);
  res.json({ threads });
});
