import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import env from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // Extract token from "Bearer <token>"
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7) // Remove "Bearer " prefix
        : authHeader;

      console.log(token, 'token, token');

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token format');
      }
      // verify token
      let verifiedUser = null;

      verifiedUser = jwtHelpers.verifyToken(token, env.JWT_SECRET as Secret);
      console.log(verifiedUser, 'verifiedUser');
      req.user = verifiedUser as JwtPayload; // role  , userid
      console.log(req.user, 'req.user');  
      // role diye guard korar jnno
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
