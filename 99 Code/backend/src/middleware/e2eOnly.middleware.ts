import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that restricts access to E2E test routes.
 * Returns 404 unless E2E_TEST=true is set in the environment.
 */
export function e2eOnly(req: Request, res: Response, next: NextFunction): void {
  if (process.env.E2E_TEST !== 'true') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
}
