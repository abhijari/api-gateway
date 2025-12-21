import express, { Request, Response } from 'express';
import { prisma } from '../utils/db';
import crypto from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

export const keysRouter = express.Router();

// Generate API key
keysRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, limitPerMinute = 60, limitPerDay = 10000 } = req.body;

    if (!userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'userId is required',
      });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Generate API key
    const key = `ak_${crypto.randomBytes(32).toString('hex')}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        key,
        limitPerMinute: parseInt(limitPerMinute),
        limitPerDay: parseInt(limitPerDay),
      },
    });

    res.status(201).json({
      id: apiKey.id,
      key: apiKey.key,
      userId: apiKey.userId,
      active: apiKey.active,
      limitPerMinute: apiKey.limitPerMinute,
      limitPerDay: apiKey.limitPerDay,
      createdAt: apiKey.createdAt,
    });
  } catch (error: unknown) {
    console.error('Create API key error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create API key',
    });
  }
});

// List all API keys
keysRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const where = userId ? { userId: userId as string } : {};

    type ApiKeyWithUser = Prisma.ApiKeyGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            email: true;
          };
        };
      };
    }>;
    const apiKeys: ApiKeyWithUser[] = await prisma.apiKey.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(
      apiKeys.map((key) => ({
        id: key.id,
        key: key.key,
        userId: key.userId,
        userEmail: key.user.email,
        active: key.active,
        limitPerMinute: key.limitPerMinute,
        limitPerDay: key.limitPerDay,
        createdAt: key.createdAt,
      }))
    );
  } catch (error: unknown) {
    console.error('List API keys error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list API keys',
    });
  }
});

// Get single API key
keysRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!apiKey) {
      res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
      });
      return;
    }

    res.json({
      id: apiKey.id,
      key: apiKey.key,
      userId: apiKey.userId,
      userEmail: apiKey.user.email,
      active: apiKey.active,
      limitPerMinute: apiKey.limitPerMinute,
      limitPerDay: apiKey.limitPerDay,
      createdAt: apiKey.createdAt,
    });
  } catch (error: unknown) {
    console.error('Get API key error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get API key',
    });
  }
});

// Enable/disable API key
keysRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active, limitPerMinute, limitPerDay } = req.body;

    const updateData: { active?: boolean; limitPerMinute?: number; limitPerDay?: number } = {};
    if (typeof active === 'boolean') {
      updateData.active = active;
    }
    if (limitPerMinute !== undefined) {
      updateData.limitPerMinute = parseInt(limitPerMinute);
    }
    if (limitPerDay !== undefined) {
      updateData.limitPerDay = parseInt(limitPerDay);
    }

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
    });

    res.json({
      id: apiKey.id,
      key: apiKey.key,
      userId: apiKey.userId,
      active: apiKey.active,
      limitPerMinute: apiKey.limitPerMinute,
      limitPerDay: apiKey.limitPerDay,
      createdAt: apiKey.createdAt,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
      });
      return;
    }
    console.error('Update API key error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update API key',
    });
  }
});

// Delete API key
keysRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.apiKey.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Not Found', message: 'API key not found' });
      return;
    }
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete API key' });
  }
});
