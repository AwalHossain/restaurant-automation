

export type CreateCategoryInput = {
    mainCategory: string;
    subCategory?: string;
    parentId?: string;
    createdBy?: string;
    updatedBy?: string;
}


export type AddSubCategoryInput = {
    mainCategoryId: string;
    subCategory: string;
    description?: string;
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
