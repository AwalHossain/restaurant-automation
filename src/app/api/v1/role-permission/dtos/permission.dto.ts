export interface CreatePermissionDto {
    name: string;
    description?: string;
    tenantId: string;
}

export interface UserRoles {
    id: string;
    username: string;
    email: string;
    phone: string;
    allPermissions: string[];
    restaurantRoles: {

      restaurantId: string;
      roleName: string;
    }[];
    branchRoles: {
      branchId: string;
      roleName: string;
    }[];
  }

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {
    updatedById?: string;
} 