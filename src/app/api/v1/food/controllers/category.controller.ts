import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";

import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { AddSubCategoryInput, UpdateCategoryWithSubsInput } from "../dtos/category.dto";
import { CategoryService } from "../services/category.services";
import { CategoryValidationService } from "../validation/category-validation.service";

export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryValidationService: CategoryValidationService
  ) {
    this.categoryService = categoryService;
    this.categoryValidationService = categoryValidationService;
  }

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const { body } = req;
    const userId = req.user?.userId;  
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const restaurantId = req.tenantContext?.restaurantId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    body.createdBy = userId;
    body.updatedBy = userId;
    body.tenantId = tenantId;
    body.branchId = branchId;
    body.restaurantId = restaurantId;
    const validatedData = await this.categoryValidationService.validateCreateCategory(body);
    const result = await this.categoryService.createCategory(validatedData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category created successfully",
      data: result
    });
  });

  getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await this.categoryService.getAllCategories();
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: result
    });
  });

  getActiveCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await this.categoryService.getActiveCategories();
    return res.status(200).json({
      success: true,
      message: "Active categories fetched successfully",
      data: result
    });
  });

  getCategoryWithChildren = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.categoryService.getCategoryWithChildren(id);
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: result
    });
  });

  addSubCategory = catchAsync(async (req: Request, res: Response) => {
    const { body } = req;
    const result = await this.categoryService.addSubCategory(body as AddSubCategoryInput);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sub category added successfully",
      data: result
    });
  });

  updateCategoryWithSubs = catchAsync(async (req: Request, res: Response) => {
    const { body } = req;
    const result = await this.categoryService.updateCategoryWithSubs(body as UpdateCategoryWithSubsInput);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully",
      data: result
    });
  });

  toggleFoodCategoryActiveStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.categoryService.toggleFoodCategoryActiveStatus(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food category active status toggled successfully",
      data: result
    });
  });
}
