/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { BranchStaffRole, Role, StaffRole } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { UserRoles } from '../api/v1/role-permission/dtos/permission.dto';
interface Location {
  type: 'RESTAURANT' | 'BRANCH';
  id: string;
  role: string;
}


export interface TenantContext {
  tenantId?: string | null;
  restaurantId?: string | null;
  branchId?: string | null;
  isSuperAdmin?: boolean;
  restaurantStaffRole?: StaffRole;
  branchStaffRole?: BranchStaffRole;
  userPermissions?: UserRoles;
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
    location?: Location;
    branchId?: string;
    isSuperAdmin?: boolean;
    restaurantStaffRole?: StaffRole;
    branchStaffRole?: BranchStaffRole;
  }
}
