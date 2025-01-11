import { Role } from "@prisma/client";
import { z } from "zod";





export const addStaffDto = z.object({
    userId: z.string(),
    branchId: z.string(),
    role: z.enum([Role.ADMIN, Role.MANAGER, Role.MODERATOR, Role.RIDER, Role.CUSTOMER, Role.STAFF, Role.DELIVERY_BOY]),
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

export const updateStaffDto = addStaffDto.partial();

export type AddStaffDto = z.infer<typeof addStaffDto>;
export type UpdateStaffDto = z.infer<typeof updateStaffDto>;



