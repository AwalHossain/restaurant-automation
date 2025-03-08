import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { DomainService } from "../../services/domain.service";

const publicTenantContext = () => {
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

            if (!tenantId) {
                throw new ApiError(httpStatus.BAD_REQUEST, `Unable to resolve tenantId`);
            }



            req.tenantContext = {
                tenantId,
                restaurantId,
                branchId
            };


            next();
        } catch (error) {
            next(error);
        }
    }
}

export default publicTenantContext; 