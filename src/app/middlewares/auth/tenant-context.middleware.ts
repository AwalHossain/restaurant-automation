import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { CacheService } from "../../../shared/cache/cache.service";
import { prisma } from "../../../shared/prisma";
import { StaffRole } from "../../../types/permission";
import { DomainService } from "../../Domainservices/domain.service";
import { UserRoles } from "../../api/v1/role-permission/dtos/permission.dto";
import { UserRoleService } from "../../api/v1/role-permission/services/userRoleService";
;

interface TenantContext {
  tenantId: string;
  restaurantId: string;
  branchId: string;
  restaurantStaffRole: StaffRole;
  // branchStaffRole: typeof BranchStaffRole;
}


const tenantContextMiddleware = () => {
  const cacheService = CacheService.getInstance();
  const userRoleService = new UserRoleService();
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
          const user = req.user;
          let tenantId: string | null = null;
          let restaurantId: string | null = null;
          let branchId: string | null = null;

          // Priority order for tenantId:
          // 1. User context
          // 2. Query params
          // 3. URL params
          // 4. Headers
          // 5. Domain resolution
          tenantId = user?.tenantId || 
                    (req.query.tenantId as string) || 
                    (req.params.tenantId as string) ||
                    (req.headers["tenant-id"] as string) ||
                    null;

          // Similar priority for restaurantId
          restaurantId = user?.restaurantId || (user?.location?.type === "RESTAURANT" ? user?.location?.id : null) ||
          (req.query.restaurantId as string) || 
          (req.params.restaurantId as string) ||
          (req.headers["restaurant-id"] as string) ||
          null;

          branchId = user?.branchId || 
          (user?.location?.type === "BRANCH" ? user?.location?.id : null) ||
          (req.params.branchId as string) ||
          (req.body.branchId as string) ||
          (req.headers["branch-id"] as string) ||
          null;
          // Only resolve from hostname if we still don't have a tenantId
          if (!tenantId) {
              const hostname = req.hostname;
              const domain = await new DomainService().resolveTenantId(hostname);
              tenantId = domain.tenantId;
              // Only set restaurantId from domain if we don't already have one
              if (!restaurantId) {
                  restaurantId = domain.restaurantId;
              }
          }

        // Tenant validation
         if (!tenantId || !restaurantId) {
             throw new ApiError(httpStatus.BAD_REQUEST, `Unable to resolve ${!tenantId ? "tenantId" : ""} ${!restaurantId ? "restaurantId" : ""} `);
         }

          // Super admin check
          if (user?.role === Role.SUPER_ADMIN) {
              req.tenantContext = {
                  tenantId: tenantId ?? null,
                  restaurantId: restaurantId ?? null
              }
              return next();
          }

          const userPermissionCacheKey = cacheService.generateKey([
            'permissions',
            user?.tenantId as string
          ]);

          

          const CACHE_TTL = 5;
          let userPermissions = await cacheService.get(userPermissionCacheKey);

          if(!userPermissions){
            userPermissions = await userRoleService.getUserRoles(user?.userId as string, tenantId) as UserRoles;
            await cacheService.set(userPermissionCacheKey, userPermissions, CACHE_TTL);
          }




    //  cache the tenant access
    const tenantAccessCacheKey = `tenant-access-${tenantId}`;
    const cacheTTL = 60 * 60 * 24; // 24 hours

    let tenantAccess = await cacheService.get(tenantAccessCacheKey);





     // Validate tenant access
    if(!tenantAccess ){

    tenantAccess = await prisma.user.findFirst({
      where: {
          id: user?.userId,
          tenantId,
          isActive: true,
          OR: [
              // Restaurant admin/staff check
              { restaurantStaff: { some: { 
                  tenantId,
                  isActive: true 
              }}},
              // Branch staff check
              { branchStaff: { some: { 
                  branch: { 
                    tenantId,
                   },
                  isActive: true 
              }}}
          ]
      },
      include: {
          restaurantStaff: true,
          branchStaff: true
      }
  });

  await cacheService.set(tenantAccessCacheKey, tenantAccess, cacheTTL);

}


    // console.log(restaurant, "restaurant");
    if (!tenantAccess) {
      throw new ApiError(httpStatus.FORBIDDEN, "No access to this tenant/restaurant");
  }



    // set tenant context
         // Set tenant context
         req.tenantContext = {
          tenantId,
          restaurantId,
          branchId,
          restaurantStaffRole: userPermissions.restaurantStaffRole,
          branchStaffRole: userPermissions.branchStaffRole,
          userPermissions
      }
    console.log(req.tenantContext, "req.tenantContext", req.params.branchId);


    next();
    } catch (error) {
        next(error);
    }
}
}

export default tenantContextMiddleware;
