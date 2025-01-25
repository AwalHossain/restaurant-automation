import { BranchStaffRole, Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { StaffRole } from "../../../types/permission";
import { DomainService } from "../../Domainservices/domain.service";

interface TenantContext {
  tenantId: string;
  restaurantId: string;
  branchId: string;
  restaurantStaffRole: StaffRole;
  branchStaffRole: BranchStaffRole;
}


const branchTenantContextMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
        const user = req.user;
        let tenantId: string | null = null;
        let restaurantId: string | null = null;
        tenantId = user?.tenantId ?? null;
        restaurantId = user?.restaurantId ?? null;
        let branchId: string | null = user?.branchId ?? null;
        branchId = req.params.branchId || req.body.branchId || req.headers['branch-id'];

        console.log(req.user, "req.user", user?.tenantId, "tenantId", tenantId);
        
        if(!tenantId){
            console.log(req.headers, "req.headers");
            tenantId = req.headers["tenant-id"] as string;
            restaurantId = req.headers["restaurant-id"] as string;
        }
        if(!branchId){
            branchId = req.headers["branch-id"] as string;
        }
        console.log(tenantId, "tenantId");

              // 2. If no tenant ID in headers, resolve from hostname
      if (!tenantId) {
        const hostname = req.hostname;
        const domain = await new DomainService().resolveTenantId(hostname);
        tenantId = domain.tenantId;
        restaurantId = domain.restaurantId;
      }


      if (!branchId) {
        throw new ApiError(httpStatus.FORBIDDEN, "Branch Access Denied");
    }

    if (!tenantId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
      }

      if(user?.role === Role.SUPER_ADMIN) {
        req.tenantContext = {
            tenantId: tenantId ?? null,
            restaurantId: restaurantId ?? null
        }

        return next();
    }




console.log(req.tenantContext, "tenantId",tenantId);

    if(!tenantId){
        return next(new ApiError(httpStatus.BAD_REQUEST, "Unauthorized Access"));
    }



    //  get restaurant context


    // set tenant context
    req.tenantContext = {
        tenantId,
        restaurantId,
        branchId
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

export default branchTenantContextMiddleware;
