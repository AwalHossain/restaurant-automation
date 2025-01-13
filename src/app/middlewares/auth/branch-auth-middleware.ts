import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload, Secret } from "jsonwebtoken";
import env from "../../../config";
import ApiError from "../../../errors/ApiError";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { prisma } from "../../../shared/prisma";



export const branchAuth = (allowedRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{

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
                console.log(req.user, 'req.user', verifiedUser); 
            console.log(req.params,'req.params');
                const branchId = req.body.branchId || req.params.branchId;
                const userId = req.user?.userId;
                console.log(branchId,'branchId');
                console.log(userId,'userId');
                if(!branchId || !userId) {
                    throw new ApiError(httpStatus.UNAUTHORIZED, 'Branch ID and User ID are required');
                }

                // get user with all their branch roles
                const user = await prisma.user.findUnique({
                    where: {
                        id: userId,
                        isActive: true
                    },
                    include: {
                        branchStaff: {
                            where:{
                                isActive: true,
                                branchId: branchId
                            }
                        }
                    }
                })

                if(!user) {
                    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
                }

                // Super admin can access all branches
                if(user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
                    return next();
                }   

                console.log(user.branchStaff[0],'user.branchStaff[0]', user.branchStaff, 'user.branchStaff');

                // check if the user has the required role for the branch
                const branchStaff = user.branchStaff[0];
                if(!branchStaff || !allowedRoles.includes(branchStaff.role)) {
                    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized to access this branch');
                }

                // add branch role to request for use in controllers
                req.branchRole = branchStaff.role;
                next();
        }catch(error){
            next(error);
        }
    }
}
