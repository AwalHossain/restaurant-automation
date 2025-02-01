import { CustomPermission } from "@prisma/client";
import { prisma } from "../../../../../shared/prisma";
import { RoleService } from "./role.service";


// services/userRoleService.ts
export class UserRoleService {
  private roleService = new RoleService();
  constructor() {
    this.roleService = new RoleService();
  }

    // Assign restaurant role
    async assignRestaurantRole(
      userId: string,
      roleId: string,
      restaurantId: string,
      tenantId: string,
      customPermissions: CustomPermission[] = []
    ) {
      return await prisma.restaurantStaff.create({
        data: {
          userId,
          roleId,
          restaurantId,
          tenantId,
          isActive: true
        }
      });
    }
  
    // Assign branch role
    async assignBranchRole(
      userId: string,
      roleId: string,
      branchId: string,
      tenantId: string,
    ) {
      return await prisma.branchStaff.create({
        data: {
          userId,
          roleId,
          branchId,
          tenantId,
          isActive: true
        }
      });
    }
  
    // Get user's roles with resolved permissions
    async getUserRoles(userId: string, tenantId: string) {
 
  
      const [restaurantRoles, branchRoles] = await Promise.all([
        // Get restaurant roles
        prisma.restaurantStaff.findMany({
          where: { userId, tenantId, isActive: true },
          include: { role: true, restaurant: true }
        }),
  
        // Get branch roles
        prisma.branchStaff.findMany({
          where: { userId, tenantId, isActive: true },
          include: { role: true, branch: true }
        })
      ]);
      // Resolve all permissions including inherited ones
      const resolvedRestaurantRoles = await Promise.all(
        restaurantRoles.map(async (role) => ({
          restaurantId: role.restaurantId,
          roleName: role.role.name,
          permissions: [
            ...await this.roleService.getAllPermissionsOfRole(role.roleId, tenantId),
          ]
        }))
      );
  
      const resolvedBranchRoles = await Promise.all(
        branchRoles.map(async (role) => ({
          branchId: role.branchId,
          roleName: role.role.name,
          permissions: [
            ...await this.roleService.getAllPermissionsOfRole(role.roleId, tenantId),
          ]
        }))
      );
  
      return {
        restaurantRoles: resolvedRestaurantRoles,
        branchRoles: resolvedBranchRoles
      };
    }
  }