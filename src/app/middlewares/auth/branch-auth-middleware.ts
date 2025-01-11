import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { prisma } from "../../../shared/prisma";



export const branchAuth = (allowedRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
                const {branchId} = req.body || req.params;
                const userId = req.user?.userId;
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
                if(user.role === Role.SUPER_ADMIN) {
                    return next();
                }

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
