/**
 * Express Server Setup Example
 * This file shows how to integrate the authentication system into your Express app
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import { apiRateLimiter } from './utils/rateLimiter';

const app: Application = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Rate limiting for all API endpoints
app.use('/api', apiRateLimiter);

/**
 * Routes
 */

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// TODO: Add other routes here
// app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/prices', priceRoutes);

/**
 * Error Handling
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Start Server
 */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Authentication routes: /api/auth/*`);
});

export default app;
