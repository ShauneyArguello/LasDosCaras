import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { listViewsForAdmin } from '../views/views.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as { status?: 'PUBLISHED' | 'UNPUBLISHED'; page: number; limit: number };
  const result = await listViewsForAdmin(query);
  res.json(result);
});
