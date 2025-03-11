

export type CreateBranchCategoryInput = {
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


export type AddSubBranchCategoryInput = {
    mainCategoryId: string;
    subCategory: string;
    description?: string;
    tenantId?: string;
    branchId?: string;
    restaurantId?: string;
    createdBy?: string;
    updatedBy?: string;
}

export type UpdateBranchCategoryInput = {
    id: string;
    name?: string;
    description?: string;
    isActive?: boolean;
    updatedBy?: string;
}

export interface UpdateBranchCategoryWithSubsInput {
    mainCategory: UpdateBranchCategoryInput;
    subCategories?: UpdateBranchCategoryInput[];
}
