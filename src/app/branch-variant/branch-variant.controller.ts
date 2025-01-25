import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BranchVariantService } from "./branch-variant.service";

export class BranchVariantController {
    private branchVariantService: BranchVariantService;
  constructor() {
    this.branchVariantService = new BranchVariantService()
  }
  bulkUpdateVariants = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const { variants } = req.body;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const userId = req.user?.userId;
    console.log(tenantId, branchId, userId, "tenantId, branchId, userId");
    if(!tenantId || !branchId || !userId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant or user not found");
    }
    const result = await this.branchVariantService.createBulkBranchVariants(foodId, tenantId, branchId, variants);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variants created successfully",
      data: result
    });
  });

  getVariantsByFoodId = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const result = await this.branchVariantService.getBranchVariantsByFoodId(foodId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variants fetched successfully",
      data: result
    });
  });

  updateVariant = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const { variants } = req.body;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const userId = req.user?.userId;
    const result = await this.branchVariantService.updateBranchVariant(foodId, tenantId as string, branchId as string, variants);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variant updated successfully",
      data: result
    });
  });

  //   add a new variant
  createBranchVariant = catchAsync(async (req: Request, res: Response) => {
    const foodId = req.body.foodId;
    const payload = req.body.variants;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const userId = req.user?.userId;

    console.log(tenantId, branchId, userId, "tenantId, branchId, userId");
    
    if(!tenantId || !userId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant or user not found");
    }
    const result = await this.branchVariantService.addNewBranchVariant(foodId, tenantId, branchId as string, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variant created successfully",
      data: result
    });
  });
}
