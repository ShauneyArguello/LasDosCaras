import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/apiError';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.badRequest('Validation failed', err.flatten()));
      }
      next(err);
    }
  };
}
