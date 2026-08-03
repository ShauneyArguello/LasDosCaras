import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import {
  createView,
  getViewById,
  listViews,
  publishView,
  unpublishView,
  updateView,
} from './views.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const view = await createView(req.user.id, req.body);
  res.status(201).json({ view });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    category?: string;
    hashtag?: string;
    sort: 'likes' | 'dislikes' | 'recent';
    page: number;
    limit: number;
    autorId?: string;
    autor?: 'me';
  };
  const result = await listViews(query, req.user?.id);
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const view = await getViewById(req.params.id, req.user);
  res.json({ view });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const view = await updateView(req.params.id, req.user, req.body);
  res.json({ view });
});

export const unpublish = asyncHandler(async (req: Request, res: Response) => {
  const view = await unpublishView(req.params.id);
  res.json({ view });
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const view = await publishView(req.params.id);
  res.json({ view });
});
