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
            tenantId = user?.tenantId ?? null;
            restaurantId = user?.restaurantId ?? null;
            let branchId: string | null = user?.branchId ?? null;
            branchId = req.params.branchId || req.body.branchId || req.headers['branch-id'];
    
            
            if(!tenantId || !restaurantId){
                console.log(req.headers, "req.headers");
                tenantId = req.headers["tenant-id"] as string;
                restaurantId = req.headers["restaurant-id"] as string;
            }
            console.log(tenantId, "tenantId");
    
    
    
    
    
                  // 2. If no tenant ID in headers, resolve from hostname
          if (!tenantId) {
            const hostname = req.hostname;
            const domain = await new DomainService().resolveTenantId(hostname)
            
            if(domain){
                tenantId = domain.tenantId ?? null;
                restaurantId = domain.restaurantId ?? null;
            }
          }

            if (!tenantId) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
            }

            req.tenantContext = {
                tenantId,
                restaurantId,
                branchId
            };

            // If branch ID is provided, validate it belongs to the restaurant
            // if (branchId) {
            //     const branch = await prisma.branch.findFirst({
            //         where: {
            //             id: branchId,
            //             restaurantId: restaurantId,
            //             isActive: true
            //         }
            //     });

            //     if (!branch) {
            //         throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
            //     }

            //     req.tenantContext.branchId = branch.id;
            // }

            next();
        } catch (error) {
            next(error);
        }
    }
}

export default publicTenantContext; 