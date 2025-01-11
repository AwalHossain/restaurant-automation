/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Role } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null;
      branchRole?: Role;
    }
  }
}

declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId: string;
  }
}
