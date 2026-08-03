import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as categoriesService from '../categories/categories.service';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoriesService.listAllCategories();
  res.json({ categories });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.createCategory(req.body.name);
  res.status(201).json({ category });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.updateCategory(req.params.id, req.body.name);
  res.json({ category });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.softDeleteCategory(req.params.id);
  res.status(204).send();
});
