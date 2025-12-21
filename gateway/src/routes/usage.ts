import express, { Request, Response } from 'express';
import { prisma } from '../utils/db';

export const usageRouter = express.Router();

// Get usage statistics for an API key
usageRouter.get('/:keyId', async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verify API key exists
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) {
      res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
      });
      return;
    }

    // Get recent logs
    const logs = await prisma.usageLog.findMany({
      where: { apiKeyId: keyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Calculate statistics
    const totalRequests = await prisma.usageLog.count({
      where: { apiKeyId: keyId },
    });

    const successfulRequests = await prisma.usageLog.count({
      where: {
        apiKeyId: keyId,
        statusCode: { gte: 200, lt: 300 },
      },
    });

    const failedRequests = await prisma.usageLog.count({
      where: {
        apiKeyId: keyId,
        statusCode: { gte: 400 },
      },
    });

    const avgLatency = await prisma.usageLog.aggregate({
      where: { apiKeyId: keyId },
      _avg: { latencyMs: true },
    });

    // Get today's requests
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRequests = await prisma.usageLog.count({
      where: {
        apiKeyId: keyId,
        timestamp: { gte: today },
      },
    });

    res.json({
      apiKeyId: keyId,
      statistics: {
        totalRequests,
        successfulRequests,
        failedRequests,
        todayRequests,
        averageLatencyMs: avgLatency._avg.latencyMs || 0,
      },
      recentLogs: logs,
    });
  } catch (error: unknown) {
    console.error('Get usage error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get usage statistics',
    });
  }
});

