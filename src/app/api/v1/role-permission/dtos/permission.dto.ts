export interface CreatePermissionDto {
    name: string;
    description?: string;
    tenantId: string;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {
    updatedById?: string;
} 