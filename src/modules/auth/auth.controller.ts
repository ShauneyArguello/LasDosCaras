import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { activateUser, getUserById, loginUser, registerUser } from './auth.service';
import { ApiError } from '../../utils/apiError';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const activate = asyncHandler(async (req: Request, res: Response) => {
  const user = await activateUser(req.params.token);
  res.json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await getUserById(req.user.id);
  res.status(200).json({ user });
});
