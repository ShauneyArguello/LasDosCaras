import { NextFunction, Request, Response } from 'express';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (handler: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
