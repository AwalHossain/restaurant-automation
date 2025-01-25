

type Permission = {
    resource: string;
    actions: string[];
}

export const PERMISSIONS = {
    SUPER_ADMIN: ["*"],
    ADMIN: [
        "restaurant:manage",
        "branch:manage",
        "staff:manage",
        "menu:manage",
        "order:manage",
    ],
    MANAGER: [
        "branch:read",
        "branch:update",
        "staff:read",
        "staff:update",
        "order:manage",
    ],
    MODERATOR: [
        "branch:read",
        "branch:update",
        "staff:read",
        "staff:update",
        "order:manage",
    ],
    STAFF: [
        "order:read",
        "order:update",
    ],
    RIDER: [
        "order:read",
        "order:update",
    ]
}

export enum StaffRole {
    ADMIN = "ADMIN",
    SUB_ADMIN = "SUB_ADMIN",
    MANAGER = "MANAGER",
    MODERATOR = "MODERATOR",
    STAFF = "STAFF",
    RIDER = "RIDER",
}

export function hasPermission(staffRole: StaffRole, resource: string, action: string): boolean {
    const permissions = PERMISSIONS[staffRole as keyof typeof PERMISSIONS];
    if(!permissions) return false;
    if(permissions.includes("*")) return true;
    return permissions.includes(resource + ":" + action);
}

