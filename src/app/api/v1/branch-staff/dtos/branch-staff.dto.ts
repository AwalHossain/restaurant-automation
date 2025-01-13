import { Role } from "@prisma/client";
import { z } from "zod";





export const addStaffDto = z.object({
    userId: z.string().min(1, 'User ID is required'),
    branchId: z.string().min(1, 'Branch ID is required'),
    role: z.enum([Role.ADMIN, Role.MANAGER, Role.MODERATOR, Role.RIDER, Role.CUSTOMER, Role.STAFF, Role.DELIVERY_BOY], {
        errorMap: () => ({ message: "Invalid role" })
    }),
    isActive: z.boolean().optional(),
});
export const updateStaffRoleDto = z.object({
    userId: z.string().min(1, 'User ID is required'),
    branchId: z.string().min(1, 'Branch ID is required'),
    role: z.enum([Role.ADMIN, Role.MANAGER, Role.MODERATOR, Role.RIDER, Role.CUSTOMER, Role.STAFF, Role.DELIVERY_BOY], {
        errorMap: () => ({ message: "Invalid role" })
    }).optional(),
    isActive: z.boolean().optional(),
});

export const permissionsDto = z.object({
    canViewOrders: z.boolean().optional(),
    canManageStaff: z.boolean().optional(),
    canManageInventory: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
    canManageSettings: z.boolean().optional(),
    canViewCustomers: z.boolean().optional(),
    canViewProducts: z.boolean().optional(),
    canViewBranches: z.boolean().optional(),
    canViewStaff: z.boolean().optional(),
    canViewSettings: z.boolean().optional(),
})


export type AddStaffDto = z.infer<typeof addStaffDto>;
export type UpdateStaffRoleDto = z.infer<typeof updateStaffRoleDto>;


