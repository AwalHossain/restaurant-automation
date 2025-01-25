

export type CreateCategoryInput = {
    mainCategory: string;
    subCategory?: string;
    parentId?: string;
    createdBy?: string;
    updatedBy?: string;
    tenantId?: string;
    branchId?: string;
    restaurantId?: string;
    description?: string;
}


export type AddSubCategoryInput = {
    mainCategoryId: string;
    subCategory: string;
    description?: string;
    tenantId?: string;
    branchId?: string;
    restaurantId?: string;
    createdBy?: string;
    updatedBy?: string;
}

export type UpdateCategoryInput = {
    id: string;
    name?: string;
    description?: string;
    isActive?: boolean;
    updatedBy?: string;
}

export interface UpdateCategoryWithSubsInput {
    mainCategory: UpdateCategoryInput;
    subCategories?: UpdateCategoryInput[];
}
