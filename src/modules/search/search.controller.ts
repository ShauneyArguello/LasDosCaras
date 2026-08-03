import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { globalSearch } from './search.service';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const result = await globalSearch(req.query.q as string);
  res.json(result);
});
