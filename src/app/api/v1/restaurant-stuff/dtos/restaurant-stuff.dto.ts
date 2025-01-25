import { RestaurantStaffRole } from "@prisma/client"
import { z } from "zod"


export const updateStaffDto = z.object({
    role: z.nativeEnum(RestaurantStaffRole).optional(),
    userId: z.string().optional(),
    branchIds: z.array(z.string()).optional(),
    restaurantId: z.string().optional(),
    isActive: z.boolean().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
})

export const createStaffDto = updateStaffDto.extend({
    userId: z.string({
        required_error: "User ID is required"
    }),
    tenantId: z.string({
        required_error: "Tenant ID is required"
    }),
    role: z.nativeEnum(RestaurantStaffRole, {
        required_error: "Role is required"
    }),

    branchIds: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
})

export const assignBranchesDto = z.object({
    branchIds: z.array(z.string()).optional(),
})

export const staffFilterDto = z.object({
    role: z.nativeEnum(RestaurantStaffRole).optional(),
    branchId: z.string().optional(),
    restaurantId: z.string().optional(),
    isActive: z.boolean().optional(),
})
export type UpdateStaffDto = z.infer<typeof updateStaffDto>
export type CreateStaffDto = z.infer<typeof createStaffDto>
export type AssignBranchesDto = z.infer<typeof assignBranchesDto>
export type StaffFilterDto = z.infer<typeof staffFilterDto>
