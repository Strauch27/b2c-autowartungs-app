import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

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

// Initialize Firebase (optional - will only initialize if configured)
import { initializeFirebase, isFirebaseConfigured } from './config/firebase';

if (isFirebaseConfigured()) {
  try {
    initializeFirebase();
    logger.info('Firebase Cloud Messaging initialized');
  } catch (error) {
    logger.warn('Firebase initialization failed - push notifications disabled');
  }
}

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
  logger.info('Demo mode enabled - demo endpoints are active at /api/demo/*');
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
