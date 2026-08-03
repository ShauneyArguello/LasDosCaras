import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import { ApiError } from '../utils/apiError';

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // ignore invalid token on optional auth routes
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}
