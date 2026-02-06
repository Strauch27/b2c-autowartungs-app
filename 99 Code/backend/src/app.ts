import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import vehiclesRoutes from './routes/vehicles.routes';
import bookingsRoutes from './routes/bookings.routes';
import servicesRoutes from './routes/services.routes';
import paymentRoutes from './routes/payment.routes';
import uploadRoutes from './routes/upload.routes';
import notificationsRoutes from './routes/notifications.routes';
import analyticsRoutes from './routes/analytics.routes';
import workshopsRoutes from './routes/workshops.routes';
import extensionsRoutes from './routes/extensions.routes';
import jockeysRoutes from './routes/jockeys.routes';
import demoRoutes from './routes/demo.routes';

export function createApp(): Application {
  const app: Application = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Stripe webhook needs raw body, so we need to handle it before JSON parsing
  app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

  // JSON parsing for all other routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'autowartungs-app-backend'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehiclesRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/workshops', workshopsRoutes);
  app.use('/api/extensions', extensionsRoutes);
  app.use('/api/jockeys', jockeysRoutes);

  // Demo routes (only active when DEMO_MODE=true)
  if (process.env.DEMO_MODE === 'true') {
    app.use('/api/demo', demoRoutes);
  }

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

// Default app instance for backward compatibility
const app = createApp();
export default app;
