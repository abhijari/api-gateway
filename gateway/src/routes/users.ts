import express, { Request, Response } from 'express';
import { prisma } from '../utils/db';

export const usersRouter = express.Router();

// Create user (simple email-based)
usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'email is required',
      });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: { email },
      });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      const user = await prisma.user.findUnique({
        where: { email: req.body.email },
      });
      if (user) {
        res.status(200).json({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        });
        return;
      }
    }
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create user',
    });
  }
});

// Get user by email
usersRouter.get('/by-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'email query parameter is required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user',
    });
  }
});

