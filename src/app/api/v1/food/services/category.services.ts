import { prisma } from "../../../../../shared/prisma";
import { CreateCategoryInput } from "../dtos/category.dto";



export class CategoryService {


    async createCategory(input: CreateCategoryInput) {
        const category = await prisma.$transaction(async (tx) => {
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
    
            let subCategory = null;
            if (input.subCategory) {
                subCategory = await tx.category.createMany({
                    data: {
                        name: input.subCategory,
                        parentId: mainCategory.id,
                    },
                },
            );
                
                // Refresh main category to include the new subcategory
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
    
}
