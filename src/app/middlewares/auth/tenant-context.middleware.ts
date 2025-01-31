import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { prisma } from "../../../shared/prisma";
import { StaffRole } from "../../../types/permission";
import { BranchStaffRole } from "../../../types/permission.types";
import { DomainService } from "../../Domainservices/domain.service";

interface TenantContext {
  tenantId: string;
  restaurantId: string;
  branchId: string;
  restaurantStaffRole: StaffRole;
  branchStaffRole: typeof BranchStaffRole;
}


const tenantContextMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
        const user = req.user;
        let tenantId: string | null = null;
        let restaurantId: string | null = null;
        tenantId = user?.tenantId ?? null;
        restaurantId = user?.restaurantId ?? null;
        let branchId: string | null = user?.branchId ?? null;

        console.log(req.user, "req.user", user?.tenantId, "tenantId", tenantId);
        
        if(!tenantId){
            console.log(req.headers, "req.headers");
            tenantId = req.headers["tenant-id"] as string;
            restaurantId = req.headers["restaurant-id"] as string;
        }

              // 2. If no tenant ID in headers, resolve from hostname
      if (!tenantId) {
        const hostname = req.hostname;
        const domain = await new DomainService().resolveTenantId(hostname);
        tenantId = domain.tenantId;
        restaurantId = domain.restaurantId;
      }
      if(user?.role === Role.SUPER_ADMIN) {
        req.tenantContext = {
            tenantId: tenantId ?? null,
            restaurantId: restaurantId ?? null
        }

        return next();
    }

      if (!tenantId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
      }


console.log(req.tenantContext, "tenantId",tenantId);

    if(!tenantId){
        return next(new ApiError(httpStatus.BAD_REQUEST, "Unauthorized Access"));
    }



    //  get restaurant context
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            OR: [
                {
                    adminId: user?.userId,
                    tenantId: user?.tenantId
                },
                {
                    branches: {
                        some: {
                            branchStaff: {
                                some: {
                                    userId: user?.userId,
                                    tenantId: tenantId,
                                    isActive: true
                                }
                            }
                        }
                    }
                }
            ],
            isActive: true
        },
        include: {
            branches: {
                where:{
                    branchStaff:{
                        some:{
                            userId: user?.userId,
                            isActive: true
                        }
                    }
                }
            },
            restaurantStaff:{
                where:{
                    userId: user?.userId,
                    isActive: true
                }
            }
        }
    });

    console.log(restaurant, "restaurant");
    if(!restaurant){
        return next(new ApiError(httpStatus.UNAUTHORIZED, "No restaurant found"));
    }

    // set tenant context
    req.tenantContext = {
        tenantId,
        restaurantId: restaurant.id,
        restaurantStaffRole: restaurant.restaurantStaff[0]
    }
    console.log(req.tenantContext, "req.tenantContext", req.params.branchId);


    // if(branchId){
    // const branch = await prisma.branch.findUnique  ({
    //     where:{
    //         id: branchId
    //     },
    //     include: {
    //         branchStaff: true
    //     }
    // })
    // if(branch){
    //       // Remove redundant check
    // // const branchStaffRole = 

    //     console.log(branch, "branch.branchStaff[0].role");

    //     req.tenantContext.branchId = branch.id;
    //     req.tenantContext.branchStaffRole = branch.branchStaff[0]?.role as BranchStaffRole || undefined; 
    // } else {
    //     throw new ApiError(httpStatus.FORBIDDEN, "Branch Access Denied");
    // }

    // console.log(req.tenantContext, "Inside tenant context", branch);

    // }

    next();
    } catch (error) {
        next(error);
    }
}
}

export default tenantContextMiddleware;
