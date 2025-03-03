import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../errors/ApiError";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { BranchCategoryValidationService } from "./branch-category-validation.service";
import { AddSubBranchCategoryInput, UpdateBranchCategoryWithSubsInput } from "./branch-category.dto";
import { BranchCategoryService } from "./branch-category.services";

export class BranchCategoryController {
  private readonly branchCategoryService: BranchCategoryService;
  private readonly branchCategoryValidationService: BranchCategoryValidationService;
  constructor(
  ) {
    this.branchCategoryService = new BranchCategoryService();
    this.branchCategoryValidationService = new BranchCategoryValidationService();
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
    const validatedData = await this.branchCategoryValidationService.validateCreateBranchCategory(body);
    const result = await this.branchCategoryService.createBranchCategory(validatedData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category created successfully",
      data: result
    });
  });

  getAllBranchCategories = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    const user = req.user;
    const branchId = req.tenantContext?.branchId;
    const result = await this.branchCategoryService.getAllBranchCategories(tenantId as string, user as JwtPayload, branchId as string);
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: result
    });
  });

  getActiveBranchCategories = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const result = await this.branchCategoryService.getActiveBranchCategories(tenantId as string, branchId as string);
    return res.status(200).json({
      success: true,
      message: "Active categories fetched successfully",
      data: result
    });
  });

  getBranchCategoryWithChildren = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const result = await this.branchCategoryService.getBranchCategoryWithChildren(id, tenantId as string, branchId as string);
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: result
    });
  });

  addSubBranchCategory = catchAsync(async (req: Request, res: Response) => {
    const { body } = req;
    const tenantId = req.tenantContext?.tenantId; 
    const branchId = req.tenantContext?.branchId;
    const result = await this.branchCategoryService.addSubBranchCategory(body as AddSubBranchCategoryInput, tenantId as string, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sub category added successfully",
      data: result
    });
  });

  updateBranchCategoryWithSubs = catchAsync(async (req: Request, res: Response) => {
    const { body } = req;
    const tenantId = req.tenantContext?.tenantId; 
    const branchId = req.tenantContext?.branchId;
    const result = await this.branchCategoryService.updateBranchCategoryWithSubs(body as UpdateBranchCategoryWithSubsInput, tenantId as string, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully",
      data: result
    });
  });

  toggleBranchCategoryActiveStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.tenantContext?.tenantId; 
    const branchId = req.tenantContext?.branchId;
    const result = await this.branchCategoryService.toggleBranchCategoryActiveStatus(id, tenantId as string, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Branch category active status toggled successfully",
      data: result
    });
  });
}
