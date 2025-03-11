import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../errors/ApiError";
import { prisma } from "../../../../shared/prisma";

export class BranchCategoryValidationService {
    // Regex for allowed characters in category names
    private readonly nameRegex = /^[a-zA-Z0-9\s_-]+$/;

    // Base schema for common category fields
    private readonly baseBranchCategorySchema = {
        name: z.string()
            .min(3, "Category name must be at least 3 characters")
            .max(30, "Category name cannot exceed 30 characters")
            .regex(this.nameRegex, "Only letters, numbers, spaces, hyphens and underscores are allowed")
            .trim(),
        description: z.string()
            .min(10, "Description must be at least 10 characters")
            .max(255, "Description cannot exceed 255 characters")
            .optional(),
        isActive: z.boolean().optional().default(true)
    };

    // Schema for creating a new category
    private readonly createBranchCategorySchema = z.object({
        mainCategory: z.string()
            .min(3, "Category name must be at least 3 characters")
            .max(30, "Category name cannot exceed 30 characters")
            .regex(this.nameRegex, "Only letters, numbers, spaces, hyphens and underscores are allowed"),
        subCategory: z.string()
            .min(3, "Subcategory name must be at least 3 characters")
            .max(30, "Subcategory name cannot exceed 30 characters")
            .regex(this.nameRegex, "Only letters, numbers, spaces, hyphens and underscores are allowed")
            .optional(),
        description: z.string()
            .min(10, "Description must be at least 10 characters")
            .max(255, "Description cannot exceed 255 characters")
            .optional(),
        parentId: z.string().optional(),
        createdBy: z.string(),
        updatedBy: z.string(),
        tenantId: z.string(),
        restaurantId: z.string(),
        branchId: z.string().optional()
    });

    // Schema for adding a subcategory
    private readonly addSubBranchCategorySchema = z.object({
        mainCategoryId: z.string(),
        subCategory: z.string()
            .min(3, "Subcategory name must be at least 3 characters")
            .max(30, "Subcategory name cannot exceed 30 characters")
            .regex(this.nameRegex),
        description: z.string()
            .min(10, "Description must be at least 10 characters")
            .max(255, "Description cannot exceed 255 characters")
            .optional()
    });

    // Schema for updating categories
    private readonly updateBranchCategorySchema = z.object({
        mainCategory: z.object({
            id: z.string(),
            name: z.string()
                .min(3, "Category name must be at least 3 characters")
                .max(30, "Category name cannot exceed 30 characters")
                .regex(this.nameRegex),
            description: z.string()
                .min(10, "Description must be at least 10 characters")
                .max(255, "Description cannot exceed 255 characters")
                .optional(),
            isActive: z.boolean().optional()
        }),
        subCategories: z.array(
            z.object({
                id: z.string(),
                name: z.string()
                    .min(3, "Subcategory name must be at least 3 characters")
                    .max(30, "Subcategory name cannot exceed 30 characters")
                    .regex(this.nameRegex),
                description: z.string()
                    .min(10, "Description must be at least 10 characters")
                    .max(255, "Description cannot exceed 255 characters")
                    .optional(),
                isActive: z.boolean().optional()
            })
        ).max(10, "Maximum 10 subcategories allowed").optional()
    });

    async validateCreateBranchCategory(input: any) {
        try {
            const validatedData = this.createBranchCategorySchema.parse(input);

            // Check if main category name is unique
            const existingMainCategory = await prisma.branchCategory.findFirst({
                where: {
                    name: validatedData.mainCategory,
                    parentId: null
                }
            });

            if (existingMainCategory) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Main category name already exists");
            }

            // If subcategory is provided, check its uniqueness under the parent
            if (validatedData.subCategory) {
                const existingSubCategory = await prisma.branchCategory.findFirst({
                    where: {
                        name: validatedData.subCategory,
                        parentId: validatedData.parentId
                    }
                });

                if (existingSubCategory) {
                    throw new ApiError(httpStatus.BAD_REQUEST, "Subcategory name already exists under this parent category");
                }
            }

            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ApiError(httpStatus.BAD_REQUEST, error.errors[0].message);
            }
            throw error;
        }
    }

    async validateAddSubBranchCategory(input: any) {
        try {
            const validatedData = this.addSubBranchCategorySchema.parse(input);

            // Check if main category exists and can accept more subcategories
            const mainCategory = await prisma.branchCategory.findUnique({
                where: { id: validatedData.mainCategoryId },
                include: { children: true }
            });

            if (!mainCategory) {
                throw new ApiError(httpStatus.NOT_FOUND, "Main category not found");
            }

            if (mainCategory.children.length >= 10) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Maximum subcategory limit reached");
            }

            // Check subcategory name uniqueness
            const existingSubCategory = await prisma.branchCategory.findFirst({
                where: {
                    name: validatedData.subCategory,
                    parentId: validatedData.mainCategoryId
                }
            });

            if (existingSubCategory) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Subcategory name already exists under this parent category");
            }

            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ApiError(httpStatus.BAD_REQUEST, error.errors[0].message);
            }
            throw error;
        }
    }

    async validateUpdateBranchCategory(input: any) {
        try {
            const validatedData = this.updateBranchCategorySchema.parse(input);

            // Validate main category existence
            const existingCategory = await prisma.branchCategory.findUnique({
                where: { id: validatedData.mainCategory.id }
            });

            if (!existingCategory) {
                throw new ApiError(httpStatus.NOT_FOUND, "Main category not found");
            }

            // If deactivating, warn about cascading effects
            if (existingCategory.isActive && validatedData.mainCategory.isActive === false) {
                // You might want to add additional logic here to handle cascading deactivation
                console.warn(`Deactivating category ${existingCategory.name} will affect all subcategories and associated foods`);
            }

            return validatedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ApiError(httpStatus.BAD_REQUEST, error.errors[0].message);
            }
            throw error;
        }
    }
}
