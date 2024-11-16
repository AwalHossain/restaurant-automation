/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null;
    }
  }
}

declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId: string;
  }
}
