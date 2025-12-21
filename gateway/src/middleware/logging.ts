import {  Response, NextFunction } from 'express';
import { RequestWithId } from './requestId';

export const loggingMiddleware = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = req.requestId || 'unknown';

  console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

