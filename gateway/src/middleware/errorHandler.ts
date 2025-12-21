import {  Response } from 'express';
import { RequestWithId } from './requestId';

export const errorHandler = (
  err: Error,
  req: RequestWithId,
  res: Response,
): void => {
  const requestId = req.requestId || 'unknown';
  
  console.error(`[${new Date().toISOString()}] [${requestId}] Error:`, err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId,
  });
};

