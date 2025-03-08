import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, Secret } from 'jsonwebtoken';
import env from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

const optionalAuth =
  (...requiredRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const authHeader = req.headers.authorization;
      console.log(authHeader, 'authHeader');
      if (!authHeader) {
        return next();
      }

      // Extract token from "Bearer <token>"
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7) // Remove "Bearer " prefix
        : authHeader;

        console.log(token, 'token, token');

      if (!token) {
        return next();
      }
      // verify token
      let verifiedUser = null;


      verifiedUser = jwtHelpers.verifyToken(token, env.JWT_SECRET as Secret);
      console.log(verifiedUser, 'verifiedUser');
      req.user = verifiedUser as JwtPayload; // role  , userid
      console.log(requiredRoles, 'requiredRoles', verifiedUser);  
      next();

    } catch (error) {
      next();
    }
  };

export default optionalAuth;
