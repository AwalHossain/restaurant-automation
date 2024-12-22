import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { VariantService } from "../services/variants.service";

export class VariantController {
  constructor(private variantService: VariantService) {
    this.variantService = variantService;
  }

  bulkUpdateVariants = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const { variants } = req.body;
    console.log(variants, "variants");
    const result = await this.variantService.createBulkVariants(foodId, variants);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variants created successfully",
      data: result
    });
  });

  getVariantsByFoodId = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const result = await this.variantService.getVariantsByFoodId(foodId);

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
    const result = await this.variantService.updateVariant(foodId, variants);

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
    const result = await this.variantService.addNewVariant(foodId, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Variant created successfully",
      data: result
    });
  });
}
