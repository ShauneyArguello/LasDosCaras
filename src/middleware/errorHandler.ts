import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { ApiError } from '../utils/apiError';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err instanceof multer.MulterError || (err instanceof Error && /Unsupported file type/.test(err.message))) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with these unique fields already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
