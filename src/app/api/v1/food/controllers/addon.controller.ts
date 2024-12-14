import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { AddOnImageService } from "../../../../../services/addonImage.service";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { AddonService } from "../services/addon.service";
import { AddOnValidationService } from "../validation/addon-validation.service";

export class AddonController {
  constructor(
    private readonly addonService: AddonService,
    private readonly addonImageService: AddOnImageService,
    private readonly addonValidationService: AddOnValidationService
  ) {
    this.addonService = addonService;
    this.addonImageService = addonImageService;
    this.addonValidationService = addonValidationService;
  }

  createAddon = catchAsync(async (req: Request, res: Response) => {
    const { file } = req;
    if (!file) throw new ApiError(400, "Image is required");
    const images = await this.addonImageService.uploadFoodImage(file);
    const { body } = req;
    let data;
    try {
      data = JSON.parse(body.data);
    } catch (error) {
      throw new ApiError(400, "Invalid addon data format");
    }
    const { userId } = req.user as { userId: string };
    data.imageUrl = images?.imageUrl;
    data.imageSize = images?.imageSize;
    data.createdById = userId;
    data.updatedById = userId;


    const result = await this.addonService.createAddOn({ ...data, images });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Addon created successfully",
      data: result
    });
  });

  createBulkFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
    const {foodId} = req.params;
    console.log(data.addons, "data.addons");
    this.addonValidationService.validateBulkAddonIds(data.addons);
    const object = {addons:data.addons, foodId};
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
    const result = await this.addonService.getAddOns();
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
    const result = await this.addonService.getAddOnById(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Addon fetched successfully by id", 
      data: result
    });
  });

  updateAddOn = catchAsync(async (req: Request, res: Response) => {
    const { file } = req;
    const { id } = req.params;
    const { userId } = req.user as { userId: string };

    
    // Initialize update data
    let updateData: any = {
      id,
      updatedById: userId
    };

    // If there's form data, parse it
    if (req.body.data) {
      try {
        const parsedData = JSON.parse(req.body.data);
        updateData = { ...updateData, ...parsedData };
        await this.addonValidationService.validateUpdateAddonInput(updateData);
      } catch (error) {
        throw new ApiError(400, "Invalid data format");
      }
    }

    // If there's a file, process it
    if (file) {
      const images = await this.addonImageService.uploadFoodImage(file);
      updateData.imageUrl = images?.imageUrl;
      updateData.imageSize = images?.imageSize;
    }

    // If neither data nor file is provided, throw error
    if (!file && !req.body.data) {
      throw new ApiError(400, "No updates provided");
    }

    const result = await this.addonService.updateAddOn(updateData);
    
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
    console.log(data, "data", foodId, addonId);
    const result = await this.addonService.updateFoodAddon({...data,foodId,addonId});
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon updated successfully",
      data: result
    });
  });



  deleteFoodAddon = catchAsync(async (req: Request, res: Response) => {
    const { foodId, addonId } = req.params;
    if(!foodId || !addonId) throw new ApiError(400, "Food id and addon id is required");
    const result = await this.addonService.deleteFoodAddon(foodId, addonId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon deleted successfully",
      data: result
    });
  });

  getAllFoodAddons = catchAsync(async (req: Request, res: Response) => {
    const result = await this.addonService.getAllFoodAddons();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All food with addons fetched successfully",
      data: result
    });
  });

  getActiveAddOns = catchAsync(async (req: Request, res: Response) => {
    const result = await this.addonService.getActiveAddOns();
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
    const result = await this.addonService.getFoodAddons(foodId);
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
    const result = await this.addonService.toggleAddOnActiveStatus(id);
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
    const result = await this.addonService.toogleFoodAddonActiveStatus(foodId, addonId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food addon toggled successfully",
      data: result
    });
  });
}
