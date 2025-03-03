import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../errors/ApiError";
import { prisma } from "../../../../shared/prisma";
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from "../../../../types/permission.types";
import {
  AddSubBranchCategoryInput,
  CreateBranchCategoryInput,
  UpdateBranchCategoryInput,
  UpdateBranchCategoryWithSubsInput
} from "./branch-category.dto";

export class BranchCategoryService {
  async createBranchCategory(input: CreateBranchCategoryInput) {
    const category = await prisma.$transaction(async tx => {
      // Create main category
      const mainCategory = await tx.branchCategory.create({
        data: {
          tenantId: input.tenantId || '',
          branchId: input.branchId || '',
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
        await tx.branchCategory.create({
          data: {
            name: input.subCategory,
            parentId: mainCategory.id,
            tenantId: input.tenantId || '',
            branchId: input.branchId || '',
          }
        });

        // Refresh and return main category with its new subcategory
        return await tx.branchCategory.findUnique({
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

  async getBranchCategoryWithChildren(id: string, tenantId: string, branchId: string) {
    const category = await prisma.branchCategory.findUnique({
      where: { id, tenantId, branchId },
      include: { children: true }
    });
    return category;
  }

  async getAllBranchCategories(tenantId: string, user: JwtPayload, branchId: string) {
    const isPublicAccess = !user;
    const isRestaurantAdmin = user?.location?.role === RRole.RESTAURANT_ADMIN;
    const isBranchManager = user?.location?.role === RRole.BRANCH_MANAGER;
    const hasRestaurantPermission = user?.permissions?.includes(RPN.MANAGE_RESTAURANT_BRANCHES);
    const hasBranchFoodPermission = user?.permissions?.includes(BPN.MANAGE_BRANCH_FOOD);
    const hasViewPermission = user?.permissions?.includes(BPN.BRANCH_VIEW_FOOD || RPN.VIEW_RESTAURANT_FOOD);
  
    const baseQuery = {
      where: {
        tenantId,
        isActive: true, // Public always sees only active categories
        ...(isBranchManager || hasBranchFoodPermission || isPublicAccess && { branchId: branchId }),
      },
      include: {
        children: {
          where: { isActive: true }
        },
        parent: true,
        branch: true,
      }
    };
          // Modify query based on role
  if (isRestaurantAdmin || hasRestaurantPermission) {
    // Admin sees everything including inactive categories
    baseQuery.where.isActive = false;
    baseQuery.include.children.where.isActive = false;
  }
  
    const categories = await prisma.branchCategory.findMany(baseQuery);

    if(isRestaurantAdmin || hasRestaurantPermission){
      return {
        type: 'RESTAURANT_ADMIN_VIEW',
        data: categories
      }
    }
    

     // Format response based on role
  if (isPublicAccess) {
   let data = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      children: cat.children.map(child => ({
        id: child.id,
        name: child.name
      }))
    }))
    return {
      type: 'PUBLIC_VIEW',
      data
    };
  }


  if (isBranchManager || hasBranchFoodPermission || hasViewPermission) {
    let data = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      children: cat.children.map(child => ({
        id: child.id,
        name: child.name
      }))
    }))
    return {
      type: 'BRANCH_VIEW',
      categories
    };
  }

  // Default view for other staff

  return {
    type: 'STAFF_VIEW',
    categories
  };
  }

  async updateBranchCategoryWithSubs(input: UpdateBranchCategoryWithSubsInput, tenantId: string, branchId: string) {
    const result = await prisma.$transaction(async tx => {
      // 1. Update main category
      const updatedMainCategory = await tx.branchCategory.update({
        where: { id: input.mainCategory.id, tenantId, branchId },
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
          input.subCategories.map((subCategory: UpdateBranchCategoryInput) =>
            tx.branchCategory.update({
              where: {
                id: subCategory.id,
                parentId: updatedMainCategory.id, // Ensure it's actually a subcategory of the main category
                tenantId,
                branchId,
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
      return await tx.branchCategory.findUnique({
        where: { id: updatedMainCategory.id, tenantId, branchId },
        include: {
          children: true
        }
      });
    });

    return result;
  }

  async addSubBranchCategory(input: AddSubBranchCategoryInput, tenantId: string, branchId: string) {
    const category = await prisma.branchCategory.findUnique({
      where: { id: input.mainCategoryId, tenantId, branchId }
    });
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Main category not found");
    }

    // create sub category
    const newSubCategory = await prisma.branchCategory.create({
      data: {
        name: input.subCategory,
        parentId: category.id,
        description: input.description,
        tenantId,
        branchId,
      }
    });

    const updatedCategory = await prisma.branchCategory.findUnique({
      where: { id: category.id },
      include: { children: true }
    });

    return updatedCategory;
  }

  // toogle food category active status and based on that show or hide food in frontend
  async toggleBranchCategoryActiveStatus(id: string, tenantId: string, branchId: string) {
    // First get the current category to check its status
    const currentCategory = await prisma.branchCategory.findUnique({
      where: { id, tenantId, branchId }
    });

    if (!currentCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    const category = await prisma.branchCategory.update({
      where: { id, tenantId, branchId },
      data: {
        isActive: !currentCategory.isActive
      }
    });
    return category;
  }

  async getActiveBranchCategories(tenantId: string, branchId: string) {
    const categories = await prisma.branchCategory.findMany({
      where: { isActive: true, parentId: null, tenantId, branchId },
      include: {
        children: {
          where: { isActive: true }
        }
      }
      });
    return categories;
  }
}
