import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import {
  AddSubCategoryInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  UpdateCategoryWithSubsInput
} from "../dtos/category.dto";

export class CategoryService {
  async createCategory(input: CreateCategoryInput) {
    const category = await prisma.$transaction(async tx => {
      // Create main category
      const mainCategory = await tx.category.create({
        data: {
          tenantId: input.tenantId || '',
          name: input.mainCategory,
          parentId: input.parentId
        },
        include: {
          parent: true,
          children: true
        }
      });

      // If subcategory is provided, create it
      if (input.subCategory) {
        // Use create instead of createMany for single subcategory
        await tx.category.create({
          data: {
            name: input.subCategory,
            parentId: mainCategory.id,
            tenantId: input.tenantId || '',
          }
        });

        // Refresh and return main category with its new subcategory
        return await tx.category.findUnique({
          where: { id: mainCategory.id },
          include: {
            parent: true,
            children: true
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
    const result = await prisma.$transaction(async tx => {
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
    });
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Main category not found");
    }

    // create sub category
    const newSubCategory = await prisma.category.create({
      data: {
        name: input.subCategory,
        parentId: category.id,
        description: input.description,
        tenantId: input.tenantId || '',
      }
    });

    const updatedCategory = await prisma.category.findUnique({
      where: { id: category.id },
      include: { children: true }
    });

    return updatedCategory;
  }

  // toogle food category active status and based on that show or hide food in frontend
  async toggleFoodCategoryActiveStatus(id: string) {
    // First get the current category to check its status
    const currentCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!currentCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        isActive: !currentCategory.isActive
      }
    });
    return category;
  }

  async getActiveCategories() {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true }
        }
      }
      });
    return categories;
  }
}
