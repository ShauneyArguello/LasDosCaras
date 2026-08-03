import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { addFavorite, removeFavorite } from './favorites.service';

export const favorite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await addFavorite(req.user.id, req.params.id);
  res.status(200).json(result);
});

export const unfavorite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await removeFavorite(req.user.id, req.params.id);
  res.status(200).json(result);
});
