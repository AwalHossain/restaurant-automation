
import { prisma } from '@/core/prisma/prisma';
import { ApiError } from '@/utils/errors';
import { JwtUtils } from '@/utils/jwt';
import { NextFunction, Request, Response } from 'express';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies['access_token'];
    
    if (!accessToken) {
      throw new ApiError(401, 'Access token not found');
    }

    const decoded = JwtUtils.verifyAccessToken(accessToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized');
    }

    next();
  };
};
