import { Prisma } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { rolePermissions } from "../../../../../types/permission.types";
import { CreatePermissionDto } from "../dtos/permission.dto";

export class PermissionService {
    async createPermission(input: CreatePermissionDto) {
        // Check if permission already exists

        // validate if the permission is already exists 
        const existingPermission = await prisma.permission.findUnique({
            where: {
                name: input.name,
                tenantId: input.tenantId
            }
        });

        if (existingPermission) {
            throw new ApiError(400, "Permission with this name already exists");
        }

        // Create new permission
        const permission = await prisma.permission.create({
            data: {
                name: input.name,
                description: input.description,
                tenantId: input.tenantId
            }
        });

        return permission;
    }

    async getPermissions(filters?: {
        search?: string;
        tenantId?: string;
    }) {
        return await prisma.permission.findMany({
            where: {
                AND: [
                    filters?.search ? {
                        OR: [
                            { name: { contains: filters.search, mode: 'insensitive' } },
                            { description: { contains: filters.search, mode: 'insensitive' } }
                        ]
                    } : {},
                    filters?.tenantId ? { tenantId: filters.tenantId } : {}
                ]
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async getAllPermissions(tenantId: string) {
        return await prisma.permission.findMany({
            where: { tenantId }
        });
    }


    async getPermissionById(id: string, tenantId: string) {

        const permission = await prisma.permission.findUnique({
            where: { id, tenantId }
        });

        if (!permission) {
            throw new ApiError(404, "Permission not found");
        }

        return permission;
    }

    async seedPermissions(tx: Prisma.TransactionClient, tenantId: string) {
        // Create all permissions in bulk if they don't exist
        const allPermissions = [
            ...rolePermissions.baseBranchStaff,
            ...rolePermissions.baseRestaurantStaff,
            ...rolePermissions.systemAdmin,
            ...rolePermissions.restaurantAdmin,
            ...rolePermissions.branchManager,
            ...rolePermissions.branchModerator,
            ...rolePermissions.rider,
        ];



        // Remove duplicates using Set
        const uniquePermissions = [...new Set(allPermissions)];

        console.log(uniquePermissions, "uniquePermissions");
        // Create permissions that don't exist
     const permissions = await prisma.permission.createMany({ 
        data: uniquePermissions.map(permission => ({
            name: permission as string,
            tenantId: tenantId,
            description: `Permission for ${permission}`
        })),
        skipDuplicates: true
    });

    return permissions;
}

}