import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { createComment, listComments } from './comments.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const comment = await createComment(req.params.threadId, req.user.id, req.body);
  res.status(201).json({ comment });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const comments = await listComments(req.params.threadId);
  res.json({ comments });
});
