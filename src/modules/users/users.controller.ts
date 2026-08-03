import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { listFavoriteIds } from '../favorites/favorites.service';

export const meFavorites = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const favorites = await listFavoriteIds(req.user.id);
  res.json({ favorites });
});
