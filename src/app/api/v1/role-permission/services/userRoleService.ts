import { CustomPermission } from "@prisma/client";
import { prisma } from "../../../../../shared/prisma";
import { UserRoles } from "../dtos/permission.dto";
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
    async getUserRoles(userId: string, tenantId: string): Promise<UserRoles> {

      const user = await prisma.user.findUnique({
        where: { id: userId, tenantId },
        include: {
          restaurantStaff: true,
          branchStaff: true
        }
      });
  
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

      // collect all permissions from both restaurant and branch roles
      const permission = new Set<string>();
      resolvedRestaurantRoles.forEach((role) => {
        role.permissions.forEach((p) => permission.add(p.permission.name));
      });
      resolvedBranchRoles.forEach((role) => {
        role.permissions.forEach((p) => permission.add(p.permission.name));
      });


      // return all permissions

      let allPermissions = Array.from(permission);

  


      return {
        id: user?.id as string,
        username: user?.username as string,
        email: user?.email as string,
        phone: user?.phone as string,
        allPermissions: allPermissions,
        restaurantRoles: resolvedRestaurantRoles.map((role) => ({
          restaurantId: role?.restaurantId as string,
          roleName: role?.roleName
        })) ,
        branchRoles: resolvedBranchRoles.map((role) => ({
          branchId: role?.branchId,
          roleName: role?.roleName,

        }))
      };


    }
  }