import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { AddOnImageService } from "../../../../../services/addonImage.service";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { AddonService } from "../services/addon.service";
import { AddOnValidationService } from "../validation/addon-validation.service";

export class AddonController {
  private readonly addonService: AddonService;
  private readonly addonImageService: AddOnImageService;
  private readonly addonValidationService: AddOnValidationService;
  constructor() {
    this.addonService = new AddonService();
    this.addonImageService = new AddOnImageService();
    this.addonValidationService = new AddOnValidationService();
  }

  createAddon = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }

    const { body } = req;
    const { userId } = req.user as { userId: string };
    body.createdById = userId;
    body.updatedById = userId;
    body.tenantId = tenantId;


    const result = await this.addonService.createAddOn(body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Addon created successfully",
      data: result
    });
  });

  createBulkFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const {foodId} = req.params;
    console.log(data.addons, "data.addons");
    await this.addonValidationService.validateBulkAddonIds(data.addons);
    const object = {addons:data.addons, foodId, tenantId};
    console.log(object, "object");
    const result = await this.addonService.createBulkFoodAddons(object);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Food addons created successfully",
      data: result
    });
  });

  getAddOns = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
      const result = await this.addonService.getAddOns(tenantId);
    console.log("result from controller");
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Okay fetched successfully",
      data: result
    });
  });

  getAddOnById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.getAddOnById(id, tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon fetched successfully by id", 
      data: result
    });
  });

  updateAddOn = catchAsync(async (req: Request, res: Response) => {
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



    const result = await this.addonService.updateAddOn(updateData,tenantId);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon updated successfully",
      data: result
    });
});
  // update food addon
  updateFoodAddon = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
    const {foodId,addonId} = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    console.log(data, "data", foodId, addonId);
    const result = await this.addonService.updateFoodAddon({...data,foodId,addonId},tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon updated successfully",
      data: result
    });
  });



  deleteFoodAddon = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const { foodId, addonId } = req.params;
    if(!foodId || !addonId) throw new ApiError(400, "Food id and addon id is required");
    const result = await this.addonService.deleteFoodAddon(foodId, addonId,tenantId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon deleted successfully",
      data: result
    });
  });

  getAllFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.getAllFoodAddons(tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All food with addons fetched successfully",
      data: result
    });
  });

  getActiveFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.getActiveFoodAddons(tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active food addons fetched successfully",
      data: result
    });
  });

  getActiveAddOns = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.getActiveAddOns(tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active addons fetched successfully",
      data: result
    });
  });

  // get food addons
  getFoodAddonsByFoodId = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.getFoodAddons(foodId,tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addons fetched successfully",
      data: result
    });
  });

  // toggle addon
  toggleAddOn = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.toggleAddOnActiveStatus(id,tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon toggled successfully",
      data: result
    });
  });

  // toggle food addon
  toggleFoodAddOn = catchAsync(async (req: Request, res: Response) => {
    const { foodId, addonId } = req.params;
    const tenantId = req.tenantContext?.tenantId;
    if(!tenantId){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tenant not found");
    }
    const result = await this.addonService.toogleFoodAddonActiveStatus(foodId, addonId,tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon toggled successfully",
      data: result
    });
  });
}
