import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getAuthorById } from './authors.service';

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const author = await getAuthorById(req.params.id);
  res.json({ author });
});
