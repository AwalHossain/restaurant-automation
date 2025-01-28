


interface CreateRoleDto {
    name: string;
    description: string;
    permissions: string[];
    inheritedFromId?: string;
    tenantId: string;
    // scope: RoleScope;
}


