import { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,

  _next: NextFunction,
) => {
  console.error('[errorHandler] Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid request data',
      errors: err.issues,
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
};
