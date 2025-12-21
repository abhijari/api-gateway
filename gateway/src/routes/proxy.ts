import express, {  Response } from 'express';
import { apiKeyAuthMiddleware, RequestWithApiKey } from '../middleware/apiKeyAuth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { forwardRequest } from '../utils/proxy';
import { prisma } from '../utils/db';

export const proxyRouter = express.Router();

// Apply auth and rate limiting to all proxy routes
proxyRouter.use(apiKeyAuthMiddleware);
proxyRouter.use(rateLimitMiddleware);

// Catch-all proxy route: /proxy/*
proxyRouter.all('/*', async (req: RequestWithApiKey, res: Response) => {
  try {
    const startTime = Date.now();
    // Path is already relative to /proxy mount point
    const path = req.path || '/';

    // Forward the request
    const response = await forwardRequest({
      method: req.method,
      path,
      headers: req.headers as Record<string, string>,
      body: req.body,
    });

    const latencyMs = Date.now() - startTime;

    // Log usage (async, don't wait)
    if (req.apiKey) {
      prisma.usageLog
        .create({
          data: {
            apiKeyId: req.apiKey.id,
            path,
            statusCode: response.status,
            latencyMs,
          },
        })
        .catch((err: unknown) => {
          console.error('Failed to log usage:', err);
        });
    }

    // Forward response
    res.status(response.status);
    
    // Forward response headers (excluding some internal ones)
    const headersToExclude = ['content-encoding', 'content-length', 'transfer-encoding'];
    Object.keys(response.headers).forEach((key) => {
      if (!headersToExclude.includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key] as string);
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    
    const statusCode = 502; // Bad Gateway

    // Log error usage
    if (req.apiKey) {
      prisma.usageLog
        .create({
          data: {
            apiKeyId: req.apiKey.id,
            path: req.path,
            statusCode,
            latencyMs: 0,
          },
        })
        .catch((err: unknown) => {
          console.error('Failed to log usage:', err);
        });
    }

    res.status(statusCode).json({
      error: 'Bad Gateway',
      message: error instanceof Error ? error.message : 'Failed to forward request',
    });
  }
});

