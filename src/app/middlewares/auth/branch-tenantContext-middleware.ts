import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { DomainService } from "../../Domainservices/domain.service";

interface TenantContext {
  tenantId: string;
  restaurantId: string;
  branchId: string;
}

const branchTenantContextMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            let tenantId: string | null = null;
            let restaurantId: string | null = null;
            let branchId: string | null = null;
            console.log(req.user, 'req.user');
            // Priority order for IDs:
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

               



            console.log(branchId, 'branchId');
            // Resolve from domain if needed

            if (!tenantId) {
                const domain = await new DomainService().resolveTenantId(req.hostname);
                tenantId = domain.tenantId;
                if (!restaurantId) {
                    restaurantId = domain.restaurantId;
                }
            }

                // Validations
                if (!tenantId) {
                    throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
                }
    
                if (!branchId) {
                    throw new ApiError(httpStatus.FORBIDDEN, "Branch Access Denied");
                }

            // Super admin check
            if (user?.role === Role.SUPER_ADMIN) {
                req.tenantContext = {
                    tenantId: tenantId ?? null,
                    restaurantId: restaurantId ?? null,
                    branchId: req.headers["branch-id"] as string ?? null
                };
                return next();
            }



            // Set context
            req.tenantContext = {
                tenantId,
                restaurantId: restaurantId ?? undefined,
                branchId
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default branchTenantContextMiddleware;