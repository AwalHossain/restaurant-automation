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
            
            // Priority order for branch ID resolution:
            // 1. Headers (always available as fallback)
            const headerBranchId = req.headers['branch-id'] as string;
            
            // 2. URL params (for specific branch operations)
            const paramBranchId = req.params.branchId;
            
            // 3. Request body (for branch-specific POST/PUT operations)
            const bodyBranchId = req.body.branchId;
            
            // 4. User context (from JWT/session)
            const userBranchId = user?.branchId;

            // Resolve branchId using priority order
            const branchId = paramBranchId || bodyBranchId || userBranchId || headerBranchId;

            // Resolve tenant context
            let tenantId: string | null = user?.tenantId || req.headers["tenant-id"] as string;
            let restaurantId: string | null = user?.restaurantId || req.headers["restaurant-id"] as string;

            // Resolve tenant from domain if not found
            if (!tenantId) {
                const hostname = req.hostname;
                const domain = await new DomainService().resolveTenantId(hostname);
                tenantId = domain.tenantId;
                restaurantId = domain.restaurantId;
            }

            // Validation checks
            if (!tenantId) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
            }

            // Special handling for super admin
            if (user?.role === Role.SUPER_ADMIN) {
                req.tenantContext = {
                    tenantId,
                    restaurantId,
                    branchId: headerBranchId // Always use header branch-id for super admin
                };
                return next();
            }

            // Regular user must have a branch ID
            if (!branchId) {
                throw new ApiError(httpStatus.FORBIDDEN, "Branch Access Denied");
            }

            // Set tenant context
            req.tenantContext = {
                tenantId,
                restaurantId,
                branchId
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default branchTenantContextMiddleware;
