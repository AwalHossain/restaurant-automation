

export const baseStaffPermissions = [
    'VIEW_FOOD', 'VIEW_ORDER', 'VIEW_INVENTORY', 'VIEW_RESTAURANT',
    'VIEW_MENU', 'VIEW_CATEGORY', 'VIEW_ADDON',
]


export const restaurantAdminPermissions = [
    ...baseStaffPermissions,
    'MANAGE_RESTAURANT',
    'MANAGE_BRANCH',
    'MANAGE_USERS',
    'MANAGE_SETTINGS',
    'MANAGE_FOOD',
    'MANAGE_ORDER',
    'MANAGE_INVENTORY',
    'MANAGE_MENU',
    'MANAGE_CATEGORY',
    'MANAGE_ADDON',
]

export const branchManagerPermissions = [
    ...baseStaffPermissions,
    'MANAGE_BRANCH',
    'MANAGE_USERS',
    'MANAGE_SETTINGS',
    'MANAGE_FOOD',
    'MANAGE_ORDER',
    'MANAGE_INVENTORY',
    'MANAGE_MENU',
    'MANAGE_CATEGORY',
    'MANAGE_ADDON',
]

export const branchModeratorPermissions = [
    ...baseStaffPermissions,
    'VIEW_ORDER',
    'VIEW_INVENTORY',
    'VIEW_CATEGORY',
    'VIEW_ADDON',
]


export const riderPermissions = [
    'VIEW_ORDER',

]

export const BranchStaffRole = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    MODERATOR: 'MODERATOR',
    STAFF: 'STAFF',
    RIDER: 'RIDER',
}
