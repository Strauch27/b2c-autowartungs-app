// Initialize Application Insights (must be first import)
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .start();
}

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { logger } from './config/logger';
import app from './app';

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

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
