import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Used by Docker healthcheck and monitoring
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'b2c-backend',
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'b2c-backend',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
