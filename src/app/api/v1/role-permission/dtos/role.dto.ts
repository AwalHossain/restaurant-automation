import { RoleScope } from "@prisma/client";



export interface CreateRoleDto {
    name: string;
    tenantId: string;
    description: string;
    permissionNames: string[];
    inheritedFromId?: string;
    scope: RoleScope;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}
