import { Prisma } from "@prisma/client";

interface RegisterUserInput {
    tenantId: string;
    email?: string;
    password: string;
    name: string;
    phone: string;
  }
  
  interface LoginUserInput {
    tenantId: string;
    phone: string;
    password: string;
  }

  interface StaffRegisterInput {
    tenantId: string;
    restaurantId?: string;
    branchId?: string;
    roleId: string;
    identifier: string;
    password: string;
    type: "EMAIL" | "PHONE" | "USERNAME";
  }

  interface SuperAdminRegisterInput {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role?:string
  }

  interface SuperAdminLoginInput {
    email: string;
    phone?: string;
    password: string;
    tenantId?: string;
  }

  interface StaffLoginInput {
    tenantId: string;
    username: string;
    restaurantId: string;
    password: string;
  }
  

 interface UnifiedLoginInput {
  identifier: string;
  password: string;
  tenantId: string;
  type: "EMAIL" | "PHONE" | "USERNAME";
}

interface RoleGroup {
  restaurantId: string;
  restaurantName: string;
  isAdmin?: boolean;
  roles:{
    branchRoles: RoleOption[];
    restaurantRoles: RoleOption[];
  }
}

interface UserLoginSession {
  lastSelectedRole: {
    roleId: string;
    type: 'RESTAURANT' | 'BRANCH';
    localId: string;
  },
  activeSessions: {
    deviceId: string;
    roleId: string;
    lastAccessedAt: Date;
  }[]
}
interface RoleOption {
  id: string;           // Format: 'restaurant_123' or 'branch_456'
  type: 'RESTAURANT' | 'BRANCH';
  roleId: string;       // Reference to UserRole table
  roleName: string;     // e.g., "Manager", "Admin"
  restaurantId?: string;   // restaurantId or branchId
  location :{
    type: 'RESTAURANT' | 'BRANCH';
    id: string;
    name?: string;
  }

}


type UserWithRoles = Prisma.UserGetPayload<{
  include:{
    restaurantStaff: {
      include:{
        role: true;
        restaurant: {
          include:{
            branches: true
          }
        };
      }
    }
    branchStaff: {
      include:{
        role: true;
        branch: {
          include:{
            restaurant: true;
          }
        };
      }
    }
  };
}>



type RestaurantStaffRecord = {
  roleId: string;
  restaurantId: string;
  role?: {
    name: string;
    // ... other role properties
  };
  restaurant?: {
    // ... restaurant properties
    branches?: {

    }[]
  } | null;
} | null;

export type BranchStaffRecord = {
  roleId: string;
  branchId: string;
  restaurantId?: string;
  role?: {
    name: string;
    // ... other role properties
  };
  branch: {
    restaurant:{
      id: string;
    }
  };
} | null; 


type StaffRecord = RestaurantStaffRecord | BranchStaffRecord | null;


interface ActiveSession {
  deviceId: string;
  roleId: string;
  location: {
    role: string;
    type: 'RESTAURANT' | 'BRANCH' | 'ADMIN_BRANCH';
    id: string;
  };
  lastAccessed: Date;
}

interface LastSelectedRole {
  roleId: string;
  location: {
    role: string;
    type: 'RESTAURANT' | 'BRANCH';
    id: string;
  };
}

export { ActiveSession, LastSelectedRole, LoginUserInput, RegisterUserInput, RestaurantStaffRecord, RoleGroup, RoleOption, StaffLoginInput, StaffRecord, StaffRegisterInput, SuperAdminLoginInput, SuperAdminRegisterInput, UnifiedLoginInput, UserLoginSession, UserWithRoles };

