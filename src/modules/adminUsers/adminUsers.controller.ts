import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { banUser, listUsers, unbanUser } from '../users/users.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as { search?: string; page: number; limit: number };
  const result = await listUsers(query);
  res.json(result);
});

export const ban = asyncHandler(async (req: Request, res: Response) => {
  const user = await banUser(req.params.id);
  res.json({ user });
});

export const unban = asyncHandler(async (req: Request, res: Response) => {
  const user = await unbanUser(req.params.id);
  res.json({ user });
});
