import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware function
export const prismaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Attach Prisma client to the request object
    req.prisma = prisma;

    // Validate request body if needed (example for JSON content)
    if (req.method === 'POST' || req.method === 'PUT') {
      if (!req.is('application/json')) {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
      }
    }

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Prisma Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}