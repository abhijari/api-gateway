import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { RequestWithId } from './requestId';

export interface RequestWithApiKey extends RequestWithId {
  apiKey?: {
    id: string;
    key: string;
    userId: string;
    active: boolean;
    limitPerMinute: number;
    limitPerDay: number;
  };
}

export const apiKeyAuthMiddleware = async (
  req: RequestWithApiKey,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract API key from header or query parameter
    const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;

    if (!apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required. Provide it via X-API-Key header or api_key query parameter.',
      });
      return;
    }

    // Find API key in database
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!keyRecord) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
      return;
    }

    if (!keyRecord.active) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'API key is disabled',
      });
      return;
    }

    // Attach API key info to request
    req.apiKey = {
      id: keyRecord.id,
      key: keyRecord.key,
      userId: keyRecord.userId,
      active: keyRecord.active,
      limitPerMinute: keyRecord.limitPerMinute,
      limitPerDay: keyRecord.limitPerDay,
    };

    next();
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate API key',
    });
  }
};

