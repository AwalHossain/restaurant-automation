import { RoleScope } from "@prisma/client";
import { PermissionName } from "../../../../../types/permission.types";


export interface CreateRoleDto {
    name: string;
    tenantId: string;
    description: string;
    permissionNames: PermissionName[];
    inheritedFromId?: string;
    scope: RoleScope;





}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}
