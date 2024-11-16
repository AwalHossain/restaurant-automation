import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { AddSubCategoryInput, CreateCategoryInput, UpdateCategoryInput, UpdateCategoryWithSubsInput } from "../dtos/category.dto";



export class CategoryService {


    async createCategory(input: CreateCategoryInput) {
        const category = await prisma.$transaction(async (tx) => {
            // Create main category
            const mainCategory = await tx.category.create({
                data: {
                    name: input.mainCategory,
                    parentId: input.parentId,
                },
                include: {
                    parent: true,
                    children: true,
                }
            });
    
            // If subcategory is provided, create it
            if (input.subCategory) {
                // Use create instead of createMany for single subcategory
                await tx.category.create({
                    data: {
                        name: input.subCategory,
                        parentId: mainCategory.id,
                    }
                });
                
                // Refresh and return main category with its new subcategory
                return await tx.category.findUnique({
                    where: { id: mainCategory.id },
                    include: {
                        parent: true,
                        children: true,
                    }
                });
            }
    
            return mainCategory;
        });
        
        return category;
    }

    async getCategoryWithChildren(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: { children: true }
        });
        return category;
    }

    async getAllCategories() {
        const categories = await prisma.category.findMany({
            include: { children: true }
        });
        return categories;
    }

    async updateCategoryWithSubs(input: UpdateCategoryWithSubsInput) {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update main category
            const updatedMainCategory = await tx.category.update({
                where: { id: input.mainCategory.id },
                data: {
                    name: input.mainCategory.name,
                    description: input.mainCategory.description,
                    isActive: input.mainCategory.isActive
                }
            });
    
            // 2. Update subcategories if provided
            if (input.subCategories && input.subCategories.length > 0) {
                // Update each subcategory
                await Promise.all(
                    input.subCategories.map((subCategory: UpdateCategoryInput) =>
                        tx.category.update({
                            where: { 
                                id: subCategory.id,
                                parentId: updatedMainCategory.id // Ensure it's actually a subcategory of the main category
                            },
                            data: {
                                name: subCategory.name,
                                description: subCategory.description,
                                isActive: subCategory.isActive
                            }
                        })
                    )
                );
            }
    
            // 3. Return updated main category with all its subcategories
            return await tx.category.findUnique({
                where: { id: updatedMainCategory.id },
                include: {
                    children: true
                }
            });
        });
    
        return result;
    }

    async addSubCategory(input: AddSubCategoryInput) {
        const category = await prisma.category.findUnique({
            where: { id: input.mainCategoryId }
        })
        if (!category) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Main category not found');
        }

        // create sub category
        const newSubCategory = await prisma.category.create({
            data: {
                name: input.subCategory,
                parentId: category.id,
                description: input.description,
            }
        })

        const updatedCategory = await prisma.category.findUnique({  
            where: { id: category.id },
            include: { children: true }
        })

        return updatedCategory;
    }
    
    
}
