import { RestaurantStaffRole } from "@prisma/client";

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
    restaurantId: string;
    username: string;
    email?: string;
    password: string;
    phone: string;
    role: RestaurantStaffRole;
  }

  interface SuperAdminRegisterInput {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role: RestaurantStaffRole;
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

export { LoginUserInput, RegisterUserInput, StaffLoginInput, StaffRegisterInput, SuperAdminLoginInput, SuperAdminRegisterInput };

