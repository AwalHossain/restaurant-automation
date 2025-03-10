// System-wide permissions (only for system admin)
export enum SystemPermissionNames {
    MANAGE_ALL_RESTAURANTS = 'MANAGE_ALL_RESTAURANTS',
    MANAGE_SYSTEM_USERS = 'MANAGE_SYSTEM_USERS',
    MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS'
}

// Restaurant-wide permissions (for restaurant level operations)
export enum RestaurantPermissionNames {
    // Restaurant level views
    VIEW_RESTAURANT_DASHBOARD = 'VIEW_RESTAURANT_DASHBOARD',
    VIEW_RESTAURANT_ORDERS = 'VIEW_RESTAURANT_ORDERS',
    VIEW_RESTAURANT_INVENTORY = 'VIEW_RESTAURANT_INVENTORY',
    VIEW_RESTAURANT_MENU = 'VIEW_RESTAURANT_MENU',
    VIEW_RESTAURANT_FOOD = 'VIEW_RESTAURANT_FOOD',
    VIEW_RESTAURANT_CATEGORIES = 'VIEW_RESTAURANT_CATEGORIES',
    VIEW_RESTAURANT_ADDONS = 'VIEW_RESTAURANT_ADDONS',
    VIEW_RESTAURANT_VARIANTS = 'VIEW_RESTAURANT_VARIANTS',
    VIEW_RESTAURANT_DISCOUNT = 'VIEW_RESTAURANT_DISCOUNT',
    VIEW_RESTAURANT_PROMOTION = 'VIEW_RESTAURANT_PROMOTION',
    VIEW_RESTAURANT_COUPON = 'VIEW_RESTAURANT_COUPON',
    VIEW_RESTAURANT_REVIEW = 'VIEW_RESTAURANT_REVIEW',
    VIEW_RESTAURANT_REPORT = 'VIEW_RESTAURANT_REPORT',
    VIEW_RESTAURANT_NOTIFICATION = 'VIEW_RESTAURANT_NOTIFICATION',
    VIEW_RESTAURANT_BRANCHES = 'VIEW_RESTAURANT_BRANCHES',
    // Restaurant-wide catalog management
    MANAGE_RESTAURANT_MENU = 'MANAGE_RESTAURANT_MENU',
    MANAGE_RESTAURANT_FOOD = 'MANAGE_RESTAURANT_FOOD',
    MANAGE_RESTAURANT_CATEGORIES = 'MANAGE_RESTAURANT_CATEGORIES',
    MANAGE_RESTAURANT_ADDONS = 'MANAGE_RESTAURANT_ADDONS',
    MANAGE_RESTAURANT_VARIANTS = 'MANAGE_RESTAURANT_VARIANTS',
    MANAGE_RESTAURANT_DISCOUNT = 'MANAGE_RESTAURANT_DISCOUNT',
    MANAGE_RESTAURANT_PROMOTION = 'MANAGE_RESTAURANT_PROMOTION',
    MANAGE_RESTAURANT_COUPON = 'MANAGE_RESTAURANT_COUPON',
    MANAGE_RESTAURANT_REVIEW = 'MANAGE_RESTAURANT_REVIEW',
    MANAGE_RESTAURANT_REPORT = 'MANAGE_RESTAURANT_REPORT',
    MANAGE_RESTAURANT_NOTIFICATION = 'MANAGE_RESTAURANT_NOTIFICATION',
    

    // Restaurant-wide settings
    MANAGE_RESTAURANT_SETTINGS = 'MANAGE_RESTAURANT_SETTINGS',
    MANAGE_RESTAURANT_USERS = 'MANAGE_RESTAURANT_USERS',
    MANAGE_RESTAURANT_BRANCHES = 'MANAGE_RESTAURANT_BRANCHES'
}

// Branch-specific permissions
export enum BranchPermissionNames {
    // View permissions
    BRANCH_VIEW_FOOD = 'BRANCH_VIEW_FOOD',
    BRANCH_VIEW_ORDER = 'BRANCH_VIEW_ORDER',
    BRANCH_VIEW_INVENTORY = 'BRANCH_VIEW_INVENTORY',
    BRANCH_VIEW_MENU = 'BRANCH_VIEW_MENU',
    BRANCH_VIEW_CATEGORY = 'BRANCH_VIEW_CATEGORY',
    BRANCH_VIEW_ADDON = 'BRANCH_VIEW_ADDON',
    BRANCH_VIEW_VARIANT = 'BRANCH_VIEW_VARIANT',
    
    // Branch management permissions
    MANAGE_BRANCH_USERS = 'MANAGE_BRANCH_USERS',
    MANAGE_BRANCH_SETTINGS = 'MANAGE_BRANCH_SETTINGS',
    MANAGE_BRANCH_FOOD = 'MANAGE_BRANCH_FOOD',
    MANAGE_BRANCH_ORDER = 'MANAGE_BRANCH_ORDER',
    MANAGE_BRANCH_INVENTORY = 'MANAGE_BRANCH_INVENTORY',


    MANAGE_BRANCH_MENU = 'MANAGE_BRANCH_MENU',
    MANAGE_BRANCH_CATEGORY = 'MANAGE_BRANCH_CATEGORY',
    MANAGE_BRANCH_ADDON = 'MANAGE_BRANCH_ADDON',
    MANAGE_BRANCH_VARIANT = 'MANAGE_BRANCH_VARIANT'

}

// Combined permissions type
// export type PermissionName = 
//     | keyof typeof SystemPermissionNames 
//     | keyof typeof RestaurantPermissionNames 
//     | keyof typeof BranchPermissionNames;


// First define the enum
// export enum PermissionNames {
//     VIEW_FOOD = 'VIEW_FOOD',
//     VIEW_ORDER = 'VIEW_ORDER',
//     VIEW_INVENTORY = 'VIEW_INVENTORY',
//     VIEW_RESTAURANT = 'VIEW_RESTAURANT',
//     VIEW_MENU = 'VIEW_MENU',
//     VIEW_CATEGORY = 'VIEW_CATEGORY',
//     VIEW_ADDON = 'VIEW_ADDON',
//     MANAGE_RESTAURANT = 'MANAGE_RESTAURANT',
//     MANAGE_BRANCH = 'MANAGE_BRANCH',
//     MANAGE_USERS = 'MANAGE_USERS',
//     MANAGE_SETTINGS = 'MANAGE_SETTINGS',
//     MANAGE_FOOD = 'MANAGE_FOOD',
//     MANAGE_ORDER = 'MANAGE_ORDER',
//     MANAGE_INVENTORY = 'MANAGE_INVENTORY',
//     MANAGE_MENU = 'MANAGE_MENU',
//     MANAGE_CATEGORY = 'MANAGE_CATEGORY',
//     MANAGE_ADDON = 'MANAGE_ADDON'
// }

// Define the permission type
export type PermissionName = keyof typeof SystemPermissionNames 
| keyof typeof RestaurantPermissionNames 
| keyof typeof BranchPermissionNames;

// Define the role types
export type RoleType = 'baseBranchStaff' | 'baseRestaurantStaff' | 'systemAdmin' | 'restaurantAdmin' | 'branchManager' | 'branchModerator' | 'rider';


export const baseRestaurantStaffPermissions: PermissionName[] = [
    'VIEW_RESTAURANT_DASHBOARD',
    'VIEW_RESTAURANT_ORDERS',
    'VIEW_RESTAURANT_INVENTORY',
    'VIEW_RESTAURANT_MENU',
    'VIEW_RESTAURANT_FOOD',
    'VIEW_RESTAURANT_CATEGORIES',
    'VIEW_RESTAURANT_ADDONS',
    'VIEW_RESTAURANT_VARIANTS',
]

// Define base branch staff permissions
export const baseBranchStaffPermissions: PermissionName[] = [
    'BRANCH_VIEW_FOOD',
    'BRANCH_VIEW_ORDER',
    'BRANCH_VIEW_INVENTORY',
    'BRANCH_VIEW_MENU',
    'BRANCH_VIEW_CATEGORY',
    'BRANCH_VIEW_ADDON',
    'BRANCH_VIEW_VARIANT'
]

// Define and export rolePermissions with proper typing
export const rolePermissions: Record<RoleType, PermissionName[]> = {
    systemAdmin: [
        // All permissions
        ...Object.values(SystemPermissionNames),
        ...Object.values(RestaurantPermissionNames),
        ...Object.values(BranchPermissionNames)
    ],
    baseBranchStaff: baseBranchStaffPermissions,
    baseRestaurantStaff: baseRestaurantStaffPermissions,
    restaurantAdmin: [
         // Restaurant-wide permissions
         ...Object.values(RestaurantPermissionNames),
         // Also has access to all branch operations
         ...Object.values(BranchPermissionNames)
    ],
    branchManager: [
        // Basic branch viewing permissions
        ...baseBranchStaffPermissions,
        // Branch management permissions
        'MANAGE_BRANCH_USERS',
        'MANAGE_BRANCH_SETTINGS',
        'MANAGE_BRANCH_FOOD',
        'MANAGE_BRANCH_ORDER',

        'MANAGE_BRANCH_INVENTORY',

        'MANAGE_BRANCH_MENU',
        'MANAGE_BRANCH_CATEGORY',
        'MANAGE_BRANCH_ADDON',
        'MANAGE_BRANCH_VARIANT'

    ],
    branchModerator: [
        ...baseBranchStaffPermissions,
        'MANAGE_BRANCH_ORDER',
        'MANAGE_BRANCH_INVENTORY'
    ],
    rider: [
        'BRANCH_VIEW_ORDER'
    ]

};

export const BRANCH_ROLE = {
    BRANCH_MANAGER: 'BRANCH_MANAGER',
    BRANCH_MODERATOR: 'BRANCH_MODERATOR',
}

export const enum RRole {
    RESTAURANT_ADMIN = 'RESTAURANT_ADMIN',
    BRANCH_MANAGER = 'BRANCH_MANAGER',
    BRANCH_MODERATOR = 'BRANCH_MODERATOR',
    SYSTEM_ADMIN = 'SYSTEM_ADMIN',
    BASE_BRANCH_STAFF = 'BASE_BRANCH_STAFF',
    BASE_RESTAURANT_STAFF = 'BASE_RESTAURANT_STAFF',
    RIDER = 'RIDER',
    CUSTOMER = 'CUSTOMER',
    ALL = 'ALL'
} 









// Export the type for rolePermissions keys
export type RolePermissionType = keyof typeof rolePermissions;