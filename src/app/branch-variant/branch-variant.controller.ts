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
    const userId = req.user?.userId;
    console.log(tenantId, userId, "tenantId, userId");
    if(!tenantId || !userId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant or user not found");
    }
    const result = await this.branchVariantService.createBulkVariants(foodId, tenantId, variants);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variants created successfully",
      data: result
    });
  });

  getVariantsByFoodId = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const result = await this.branchVariantService.getVariantsByFoodId(foodId);

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
    const result = await this.branchVariantService.updateVariant(foodId, variants);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variant updated successfully",
      data: result
    });
  });

  //   add a new variant
  createVariant = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const payload = req.body;
    const tenantId = req.tenantContext?.tenantId;
    const userId = req.user?.id;
    if(!tenantId || !userId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant or user not found");
    }
    const result = await this.branchVariantService.addNewVariant(foodId, tenantId, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variant created successfully",
      data: result
    });
  });
}
