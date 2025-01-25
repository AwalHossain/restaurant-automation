/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { BranchStaffRole, Role, StaffRole } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';


export interface TenantContext {
  tenantId?: string | null;
  restaurantId?: string | null;
  branchId?: string | null;
  isSuperAdmin?: boolean;
  restaurantStaffRole?: StaffRole;
  branchStaffRole?: BranchStaffRole;
}


declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null;
      branchRole?: BranchStaffRole;
      tenantContext?: TenantContext;
    }
  }
}

declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId: string;
    role: Role;
    tenantId?: string;
    restaurantId?: string;
    branchId?: string;
    isSuperAdmin?: boolean;
    restaurantStaffRole?: StaffRole;
    branchStaffRole?: BranchStaffRole;
  }
}
