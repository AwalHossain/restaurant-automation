import { Prisma, RoleScope } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { rolePermissions } from "../../../../../types/permission.types";
import { CreateRoleDto } from "../dtos/role.dto";
import { validateCircularInheritance } from "./role.validation";



export class RoleService {
    constructor(){
        
    }


    async createRole(tx: Prisma.TransactionClient, input: CreateRoleDto) {
   // Remove duplicates from input permissions
   input.permissionNames = [...new Set(input.permissionNames)];

        // validate circular inheritance
        if(input.inheritedFromId) {
            await validateCircularInheritance(tx,input.inheritedFromId);
        }

       // Add debug logging
    console.log("Role:", input.name);
    console.log("Requested permissions:", input.permissionNames);
    
    const permissions = await tx.permission.findMany({
        where: {
            name: {
                in: input.permissionNames as string[]
            }
        }
    });
    
    console.log("Found permissions:", permissions.map(p => p.name));
    
    // Find missing permissions
    const missingPermissions = input.permissionNames.filter(
        name => !permissions.find(p => p.name === name)
    );
    
    if(missingPermissions.length > 0) {
        console.log("Missing permissions:", missingPermissions);
        throw new ApiError(400, `Missing permissions: ${missingPermissions.join(', ')}`);
    }

    
        if(!permissions.length || permissions.length !== input.permissionNames.length) {
            throw new ApiError(400, "Some permissions are not found");
        }


        const role = await tx.userRole.create({
            data: {
                name: input.name,
                scope: input.scope,
                description: input.description,
                isActive: true,
                tenantId: input.tenantId,
                rolePermissions:{
                    create: permissions.map((permission) => ({
                        permissionId: permission.id,
                        tenantId: input.tenantId
                    }))
                },
                inheritedFromId: input.inheritedFromId || null,
                
            }
        })

        return role;
    }

    async getAllRoles(tenantId: string) {
        const roles = await prisma.userRole.findMany({
            where: {
                tenantId: tenantId
            },
        })
        return roles;
    }

    // get all permissions
    async getAllPermissionsOfRole(roleId: string, tenantId: string) {
        const role = await prisma.userRole.findUnique({
            where: {
                id: roleId,
                tenantId: tenantId
            },
            include: {
                inheritedFrom: true,
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        })

        if(!role) {
            throw new ApiError(404, "Role not found");
        }

        let allPermissions = [...role.rolePermissions];
        if(role.inheritedFromId) {
            const inheritedPermissions = await this.getAllPermissionsOfRole(role.inheritedFromId, tenantId);
            // to remove duplicacy use Set
            allPermissions = [...new Set([...allPermissions, ...inheritedPermissions])];
        }

        const permissions = allPermissions;
        return permissions;
    }

   
    // create default role for a tenant
    async createDefaultRole(
        tx: Prisma.TransactionClient,
        tenantId: string) {
        
        // create base role first 

        const baseRestaurantStaffRole = await this.createRole(tx,{
        name: "BASE_RESTAURANT_STAFF",
            tenantId,
            scope: RoleScope.RESTAURANT, 
            permissionNames: rolePermissions.baseRestaurantStaff,
            description: "Base staff role for a restaurant",
        })

        const baseStaffRole = await this.createRole(tx,{
        name: "BASE_BRANCH_STAFF",
            tenantId,
            scope: RoleScope.BRANCH, 
            permissionNames: rolePermissions.baseBranchStaff,
            description: "Base staff role for a branch",
        })


        // create other roles inheriting form base 
        const roles = await Promise.all([
            // Restaurant Admin
            this.createRole(tx,{
                name: "RESTAURANT_ADMIN",
                tenantId,
                scope: RoleScope.RESTAURANT,
                permissionNames: rolePermissions.restaurantAdmin,
                description: "Restaurant admin role for a restaurant",
                inheritedFromId: baseRestaurantStaffRole.id

            }),
            
            // Branch Manager
            this.createRole(tx,{
                name: "BRANCH_MANAGER",
                tenantId,
                scope: RoleScope.BRANCH,
                permissionNames: rolePermissions.branchManager,
                description: "Branch manager role for a branch",
                inheritedFromId: baseRestaurantStaffRole.id


            }),
            // Moderator
            this.createRole(tx,{
                name: "BRANCH_MODERATOR",
                tenantId,
                scope: RoleScope.BRANCH,
                permissionNames: rolePermissions.branchModerator,
                description: "Branch moderator role for a branch",
                inheritedFromId: baseStaffRole.id

            }),
            // Rider
            this.createRole(tx,{
                name: "RIDER",
                tenantId,
                scope: RoleScope.RESTAURANT,
                permissionNames: rolePermissions.rider,
                description: "Rider role for a restaurant",
                inheritedFromId: baseStaffRole.id
            })
        ])

        console.log(roles, "roles of default");

        return {
            baseStaffRole,
            roles
        };
    }

    // get all roles with permissions
    async getAllRolesWithPermissions(tenantId: string) {
        const roles = await prisma.userRole.findMany({
            where: {
                tenantId: tenantId
            },
           include:{
            rolePermissions: {
                select:{
                    permission: true
                }
            }
           }
        })
        return roles;
    }


}
