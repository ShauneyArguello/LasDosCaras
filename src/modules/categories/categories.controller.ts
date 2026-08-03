import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as categoriesService from './categories.service';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoriesService.listCategories();
  res.json({ categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.getCategoryById(req.params.id);
  res.json({ category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.createCategory(req.body.name);
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.updateCategory(req.params.id, req.body.name);
  res.json({ category });
});
