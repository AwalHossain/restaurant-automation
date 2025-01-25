import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../errors/ApiError";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { BranchAddonService } from "./branch-addon.service";
import { BranchAddonValidationService } from "./branch-addon.validation";

export class BranchAddonController {
  private readonly branchAddonService: BranchAddonService;
  private readonly branchAddonValidationService: BranchAddonValidationService;
  constructor() {
    this.branchAddonService = new BranchAddonService();
    this.branchAddonValidationService = new BranchAddonValidationService();
  }

  createBranchAddon = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;

    const { body } = req;
    const { userId } = req.user as { userId: string };
    body.createdById = userId;
    body.updatedById = userId;
    body.tenantId = tenantId;
    body.branchId = branchId;

    const result = await this.branchAddonService.createBranchAddOn(body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Addon created successfully",
      data: result
    });
  });

  createBulkBranchFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const {foodId} = req.params;
    console.log(data.addons, "data.addons");
    await this.branchAddonValidationService.validateBulkBranchAddonIds(data.addons);
    const object = {addons:data.addons, tenantId, branchFoodId:foodId, branchId:branchId as string};
    console.log(object, "object");
    const result = await this.branchAddonService.createBulkBranchFoodAddons(object);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Food addons created successfully",
      data: result
    });
  });

  getBranchAddOns = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
      const result = await this.branchAddonService.getBranchAddOns(tenantId, branchId as string);
    console.log("result from controller");
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Okay fetched successfully",
      data: result
    });
  });

  getBranchAddOnById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.getBranchAddOnById(id, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon fetched successfully by id", 
      data: result
    });
  });

  updateBranchAddOn = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const { id } = req.params;
    const { userId } = req.user as { userId: string };
    const { body } = req;

    
    // Initialize update data
    let updateData: any = {
      id,
      updatedById: userId,
      ...body
    };



    const result = await this.branchAddonService.updateBranchAddOn(updateData,tenantId);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon updated successfully",
      data: result
    });
});
  // update food addon
  updateBranchFoodAddon = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
    const {foodId,addonId} = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    console.log(data, "data", foodId, addonId);
    const result = await this.branchAddonService.updateBranchFoodAddon({...data,foodId,addonId},tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon updated successfully",
      data: result
    });
  });



  deleteBranchFoodAddon = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const { foodId, addonId } = req.params;
    if(!foodId || !addonId) throw new ApiError(400, "Food id and addon id is required");
    const result = await this.branchAddonService.deleteBranchFoodAddon(foodId, addonId,tenantId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon deleted successfully",
      data: result
    });
  });

  getAllBranchFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.getAllBranchFoodAddons(tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All food with addons fetched successfully",
      data: result
    });
  });

  getActiveBranchFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.getActiveBranchFoodAddons(tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active food addons fetched successfully",
      data: result
    });
  });

  getActiveBranchAddOns = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.getActiveBranchAddOns(tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active addons fetched successfully",
      data: result
    });
  });

  // get food addons
  getBranchFoodAddonsByFoodId = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.getBranchFoodAddons(foodId,tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addons fetched successfully",
      data: result
    });
  });

  // toggle addon
  toggleBranchAddOn = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.toggleBranchAddOnActiveStatus(id,tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon toggled successfully",
      data: result
    });
  });

  // toggle food addon
  toggleBranchFoodAddOn = catchAsync(async (req: Request, res: Response) => {
    const { foodId, addonId, branchAddonId } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.branchAddonService.toogleBranchFoodAddonActiveStatus(foodId, addonId,tenantId, branchAddonId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon toggled successfully",
      data: result
    });
  });
}
