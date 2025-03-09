import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { DomainService } from '../../app/Domainservices/domain.service';
import ApiError from '../../errors/ApiError';

// Base context resolver
class ContextResolver {
    private domainService: DomainService;
    constructor(){
        this.domainService = new DomainService();
    }
  protected async resolveTenantFromRequest(req: Request) {
    const user = req.user;
    let tenantId = user?.tenantId;
    let restaurantId = user?.restaurantId;

    // Check headers
    if (!tenantId || !restaurantId) {
      tenantId = req.headers["tenant-id"] as string;
      restaurantId = req.headers["restaurant-id"] as string;
    }

    // Resolve from domain
    if (!tenantId) {
      const domain = await this.domainService.resolveTenantId(req.hostname);
      tenantId = domain?.tenantId as string;
      restaurantId = domain?.restaurantId as string;
    }



    return { tenantId, restaurantId };
  }

  protected async resolveBranchFromRequest(req: Request) {
    return req.params.branchId || 
           req.body.branchId || 
           req.headers['branch-id'] as string;
  }
}

// Specific context middlewares extending base resolver
export class TenantContextMiddleware extends ContextResolver {
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { tenantId, restaurantId } = await this.resolveTenantFromRequest(req);
        
        if (!tenantId) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
        }

        // Additional authenticated user validations
        if (req.user && !this.validateUserTenantAccess(req.user, tenantId)) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Invalid tenant access');
        }

        req.tenantContext = { tenantId, restaurantId };
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private validateUserTenantAccess(user: any, tenantId: string): boolean {
    // Implement tenant access validation
    return true;
  }
}

export class PublicContextMiddleware extends ContextResolver {
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { tenantId, restaurantId } = await this.resolveTenantFromRequest(req);
        
        if (!tenantId) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to resolve tenant');
        }

        req.tenantContext = { tenantId, restaurantId };
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export class BranchContextMiddleware extends ContextResolver {
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { tenantId, restaurantId } = await this.resolveTenantFromRequest(req);
        const branchId = await this.resolveBranchFromRequest(req);

        if (!tenantId || !branchId) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required context');
        }

        // Additional branch validations
        await this.validateBranchAccess(branchId, restaurantId);

        req.tenantContext = { tenantId, restaurantId, branchId };
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private async validateBranchAccess(branchId: string, restaurantId: string) {
    // Implement branch access validation
  }
} 