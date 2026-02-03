/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for push notifications via FCM
 */

import admin from 'firebase-admin';
import { logger } from './logger';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if service account credentials are provided
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccount) {
      logger.warn('Firebase service account not configured. Push notifications will be disabled.');
      throw new Error('Firebase service account not configured');
    }

    // Parse the service account JSON
    const credentials = JSON.parse(serviceAccount);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

/**
 * Get Firebase Admin instance
 */
export const getFirebaseAdmin = (): admin.app.App => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

/**
 * Get Firebase Messaging instance
 */
export const getMessaging = (): admin.messaging.Messaging => {
  const app = getFirebaseAdmin();
  return admin.messaging(app);
};

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT;
};
