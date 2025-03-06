
import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../errors/ApiError";
import { CacheService } from "../../../shared/cache/cache.service";
import { PermissionName, RRole } from "../../../types/permission.types";
import { UserRoles } from "../../api/v1/role-permission/dtos/permission.dto";
import { UserRoleService } from "../../api/v1/role-permission/services/userRoleService";



enum AdminRole {
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
}

// export userRole Services
// Create a type for role shortcuts
type RoleAccess = 'ALL' | 'STAFF_ONLY' | 'ADMIN_ONLY' | 'PUBLIC';


export const accessControl = (options: {
    // for customer routes
    access?: RoleAccess,
    // for staff routes,
    staffPermissions?: PermissionName[],
    // for admin routes
    // Optional: Specific roles that can bypass permission checks
    allowedRoles?: RRole[];


}) => {
    const cacheService = CacheService.getInstance();
    const userRoleService = new UserRoleService();

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as JwtPayload;

            // ALL access means any authenticated user can access
            if ((options.access === 'ALL' || options.access === 'PUBLIC') && !req.user) {
                return next();
            }

            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
            }

            if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
                return next();
            }

            // customer access check 
            if (options.allowedRoles?.includes(user?.role as RRole)) {
                // for customer-specific routes, validate the customer access
                return next();
            }



            // staff access check
            if (options.staffPermissions?.length) {
                // for staff-specific routes, validate the staff access
                // Check if user has any of the allowed roles
                if (options.allowedRoles?.includes(user.location?.role as RRole)) {
                    return next();
                }
                // In permission middleware
                const userPermissionCacheKey = cacheService.generateKey([
                    'permissions',
                    user.tenantId as string
                ]);
                const CACHE_TTL = 5;


                let userPermissions = await cacheService.get(userPermissionCacheKey);


                if (!userPermissions) {
                    userPermissions = await userRoleService.getUserRoles(
                        user.userId as string,
                        user.tenantId as string
                    ) as UserRoles
                    await cacheService.set(userPermissionCacheKey, userPermissions, CACHE_TTL);


                }
                console.log(userPermissions, "userPermissions");
                const hasRequiredPermission = options.staffPermissions?.some(permission => userPermissions.allPermissions.includes(permission));

                if (!hasRequiredPermission) {
                    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
                }
            }

            next();


        } catch (error) {
            next(error);
        }

    }

}


// helper to validate customer specific access
const validateCustomerAccess = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    if (user.role === Role.CUSTOMER) {
        return next();
    }
}