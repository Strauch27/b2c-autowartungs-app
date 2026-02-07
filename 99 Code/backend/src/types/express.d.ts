import { JWTPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      file?: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
        fieldname: string;
        encoding: string;
      };
      files?: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
        fieldname: string;
        encoding: string;
      }>;
    }
  }
}
