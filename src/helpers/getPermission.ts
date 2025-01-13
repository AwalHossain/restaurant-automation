import { Role } from "@prisma/client"

export const getPermissions = (role: Role) => {

    const basePermissions ={
        canViewOrders: false,
        canManageStaff: false,
        canManageInventory: false,
        canViewReports: false,
        canManageSettings: false,
        canViewCustomers: false,
        canViewProducts: false,
        canViewBranches: false,
        canViewStaff: false,
        canViewSettings: false,
    }

    switch(role){
        case Role.MANAGER:
            return {
                ...basePermissions,
                canViewOrders: true,
                canManageStaff: true,
                canManageInventory: true,
                canViewReports: true,
                canManageSettings: true,
                canViewCustomers: true,
                canViewProducts: true,
                canViewBranches: true,
                canViewStaff: true,
                canViewSettings: true,
            }
        case Role.MODERATOR:
            return {
                ...basePermissions,
                canViewOrders: true,
                canManageInventory: true,
                canViewReports: true,
                canViewCustomers: true,
                canViewProducts: true,
            }
        case Role.RIDER:
            return {
                ...basePermissions,
                canViewOrders: true,
                canViewCustomers: true,
                canViewProducts: true,
            }
        default:
            return basePermissions
    }
}
