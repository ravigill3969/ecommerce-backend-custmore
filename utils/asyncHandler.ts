// src/middleware/asyncHandler.ts
import { Request, Response, NextFunction } from "express";



type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps async route handlers to automatically catch errors and forward to Express error handler
 * Eliminates the need for try/catch blocks in every route
 *
 * @param fn Async function to wrap
 * @returns Express middleware function
 */
export const catchAsync = (fn: AsyncRequestHandler) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
