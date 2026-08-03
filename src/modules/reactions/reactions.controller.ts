import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { setSideReaction } from './reactions.service';

export const like = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await setSideReaction(req.user.id, req.params.id, req.params.side as 'a' | 'b', 'LIKE');
  res.status(200).json(result);
});

export const dislike = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await setSideReaction(req.user.id, req.params.id, req.params.side as 'a' | 'b', 'DISLIKE');
  res.status(200).json(result);
});
