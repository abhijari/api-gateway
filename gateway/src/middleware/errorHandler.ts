import { Request, Response, NextFunction } from 'express';
import { RequestWithId } from './requestId';

export const errorHandler = (
  err: Error,
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.requestId || 'unknown';
  
  console.error(`[${new Date().toISOString()}] [${requestId}] Error:`, err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId,
  });
};

